/**
 * Created on 1399/9/18 (2020/12/8).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

export const defaultLogger = (state, action, newState = null) => {
	console.group(
		'%c%s %c%s %c%s %s', 'font-weight:normal;color:#888', 'action',
		'color:#222', action.type,
		'font-weight:normal;color:#888', '@', new Date().toLocaleTimeString(),
	)
	// console.groupCollapsed('%c%s', 'font-weight:bold;color:#9E9E9E', 'prev-state')
	// console.log('%c%s', 'font-weight:bold;color:#9E9E9E', JSON.stringify(state, null, '\t'))
	// console.groupEnd()

	console.log('%c%s\t%o', 'font-weight:bold;color:#9E9E9E', 'prev-state', state)

	console.log('%c%s\t', 'font-weight:bold;color:#03A9E4', 'action', action)

	console.log('%c%s\t%o', 'font-weight:bold;color:#4CAF50', 'new-state',
		newState === state ? 'PREV-STATE' : newState ?? 'NO-TRANSFORM')

	// console.groupCollapsed('%c%s', 'font-weight:bold;color:#4CAF50', 'new-state')
	// console.log('%c%s', 'font-weight:bold;color:#4CAF50', JSON.stringify(newState, null, '\t'))
	// console.groupEnd()
	console.groupEnd()
}
