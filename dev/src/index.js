import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import { BrowserRouter, Route } from 'react-router-dom';
import ReactGA from 'react-ga'

ReactGA.initialize('UA-102272677-1', {
	debug: true
})

function logPageView() {
	ReactGA.set({ page: window.location })
	ReactGA.pageview(window.location.pathName)
	console.log("LOGGED: " + window.location)
}

ReactDOM.render((
	<BrowserRouter onUpdate={logPageView()}>
		<Route path="/" component={App} />
	</BrowserRouter>
	),
 	document.getElementById('root')
);
