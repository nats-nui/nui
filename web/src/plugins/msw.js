// start MSW (mock service worler)

//const { getAppUrl } = require('stores/user/utils')

//if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK === 'true') {
	import { worker } from '../mocks/ajax/browser'

	worker.start()

	// worker.start({
	// 	serviceWorker: {
	// 		url: getAppUrl('mockServiceWorker.js'),
	// 	},
	// })

	// // used in cypres
	// window.getStoreAuth = ()=>{
	// 	const { getStoreAuth } = require('../store/auth')
	// 	return getStoreAuth();
	// }
//}
