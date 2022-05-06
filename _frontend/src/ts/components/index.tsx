import * as React from 'react';
import { RecentSalesView } from './views/recent-sales';
import { TopSalesView } from './views/top-sales';
import { SplashModal } from './widgets/splash-modal';
import { Sidebar } from './views/sidebar';
import { Header } from './views/header';

import { SalesEventHub  } from '../services/messages';
import { EntityStore } from '../services/meta-store';
import { BackendService, Product, SalesEvent, User } from '../services/backend';

interface State {
	mode: 'top' | 'recent';
	splash: boolean;
	mostRecentSale: { user: User; product: Product };
	// ...
}

export class DashboardApplication extends React.Component<{}, State> {
	state: State = {
		mode: 'top',
		splash: false,
		mostRecentSale : undefined,
	}

	backendService = BackendService.Instance;

	componentDidMount(): void {
		setTimeout(this.switchMode.bind(this), this.state.mode === 'top' ? 60000 : 30000);
		this.backendService.registerSalesEventListener(this.handleSalesEvent.bind(this));
	}

	render() {
		const { splash, mode } = this.state;

		return (
			<>
				<Sidebar />
				<div className="main">
					<Header />

					{mode === 'recent'
							? <RecentSalesView />
							: <TopSalesView />
					}

					{splash && <SplashModal event={this.state.mostRecentSale} />}
				</div>
			</>
		)
	}

	switchMode() {
		this.setState({ mode: this.state.mode === 'recent' ? 'top' : 'recent' })
		setTimeout(this.switchMode.bind(this), this.state.mode === 'top' ? 60000 : 30000);
	}

	splashQueue: SalesEvent[] = [];
	handleSalesEvent(event: SalesEvent) {
		this.splashQueue.push(event);
		console.log('New sale event');
		
		// If there isn't already a splash up, then we need to kickstart the splash timer
		// Otherwise if it's already going, it will automaticly show the next splash message
		if (!this.state.splash) this.displaySplash.bind(this)();
	}

	async displaySplash() {
		console.log('Display called');
		
		const mostRecentSale = this.splashQueue.shift();

		if (!mostRecentSale) {
			return this.setState({
				splash: false,
				mostRecentSale: undefined,
			});
		}

		this.setState({
			splash: true,
			mostRecentSale: {
				user: await this.backendService.getUser(mostRecentSale.userId),
				product: await this.backendService.getProduct(mostRecentSale.productId),
			},
		});

		setTimeout(this.displaySplash.bind(this), 5000);
	}
}
