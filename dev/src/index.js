import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import { BrowserRouter, Route } from 'react-router-dom';
import ReactGA from 'react-ga'

ReactGA.initialize('UA-102272677-2', {
	debug: false
})

function logPageView() {
	var location = window.location.pathname
	ReactGA.set({ page: location })
	ReactGA.ga('send', 'pageview', location);
}

ReactDOM.render((
	<BrowserRouter onUpdate={logPageView()}>
		<Route path="/" component={App} />
	</BrowserRouter>
	),
 	document.getElementById('root')
);
