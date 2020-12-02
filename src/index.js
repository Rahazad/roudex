import deepEqual from '@rahazad/deep-equal'
import {payloadReducer} from '@rahazad/payload-reducer'
import React, {useContext, useEffect, useReducer} from 'react'
import {defaultLogger} from './logger'

/**
 * Created on 1399/9/7 (2020/11/27).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

const stateManager = {}  // will be initialized

const StoreProvider = React.memo(({children}) => {
	const {
		rootReducer,
		defaultInitialState,
		initializer,
		payloadCreators,
		AppContext,
	} = stateManager

	const [state, dispatch] = useReducer(
		rootReducer,
		defaultInitialState,
		initializer,
	)

	const popStateListener = ({state}) => dispatch({
		type: 'POP-',  // will be completed
		state,         // special action with full `state` instead of `payload`
	})

	useEffect(() => {
		window.addEventListener('popstate', popStateListener)
		return () => window.removeEventListener('popstate', popStateListener)
	}, [])

	const dp = Object.fromEntries(Object.entries(payloadCreators).map(
		([type, payloadCreator]) => ([
			type,
			(...args) => dispatch({
				type,
				payload: payloadCreator(...args),
			}),
		]),
	))

	return (
		<AppContext.Provider value={{state, dp, dispatch}}>
			{children}
		</AppContext.Provider>
	)
})

const useStore = () => useContext(stateManager.AppContext)

// noinspection JSUnusedGlobalSymbols
export const roudexInitializer = (
	initialState,
	payloadCreators,
	createPayloadFromUrl,
	createPathFromState,
	{
		logger = process.env.NODE_ENV === 'production' ? null : defaultLogger,
	} = {},
) => {
	if ('_serial' in initialState)
		throw new Error(
			'The `_serial` property in `initialState` is managed automatically.\n' +
			`You shouldn't provide it.\ninitialState:\n${initialState}`,
		)
	stateManager.defaultInitialState = initialState
	initialState._serial = 0

	stateManager.AppContext = React.createContext({
		state: {},
		dp: {},
		dispatch: null,
	})

	stateManager.payloadCreators = payloadCreators

	stateManager.rootReducer = (state, action) => {
		if (action.state) {
			if (action.payload)
				console.warn('The action provides both `payload` and `state`!\n' +
					'Provided `payload` will be ignored.\naction:\n', action)

			const newState = action.state

			action.type += newState._serial > state._serial ? 'FWD' : 'BACK'

			logger?.(state, action, newState)
			return newState
		}

		if (action.url) {
			if (action.payload)
				console.warn('The action provides both `payload` and `url`!\n' +
					'Provided `payload` will be ignored and overridden.\naction:\n', action)
			action.payload = createPayloadFromUrl(action.url)
		}
		const {payload} = action

		if (!payload) {
			console.warn('No payload detected (directly or indirectly)!', {action})
			return state
		}

		const {noTransform, newState} = payloadReducer(state, payload)

		const url0 = window.location.href
		const newUrl = new URL(url0).origin + createPathFromState(newState)

		if (noTransform) {
			if (newUrl === url0 && deepEqual(window.history.state, state))
				logger?.(state, action)
			else {
				logger?.(state, action, state)
				window.history.replaceState(state, '', newUrl)
			}
			return state
		}

		newState._serial++
		logger?.(state, action, newState)

		const replaceOrPushState = action.url || newUrl === url0 ? 'replaceState' : 'pushState'

		window.history[replaceOrPushState](newState, '', newUrl)

		return newState
	}

	stateManager.initializer = defaultInitialState =>
		stateManager.rootReducer(window.history.state ?? defaultInitialState, {
			type: 'INIT',
			url: window.location.href,
		})

	const {
		rootReducer,
		defaultInitialState,
	} = stateManager

	return {
		StoreProvider,
		useStore,
		rootReducer,
		defaultInitialState,
	}
}
