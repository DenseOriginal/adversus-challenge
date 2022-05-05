import * as React from 'react';
import { RecentSalesView } from './views/recent-sales';
import { TopSalesView } from './views/top-sales';
import { SplashModal } from './widgets/splash-modal';
import { Sidebar } from './views/sidebar';
import { Header } from './views/header';

import { SalesEventHub  } from '../services/messages';
import { EntityStore } from '../services/meta-store';

interface State {
	mode: 'top' | 'recent';
	splash: boolean;
	// ...
}
export class DashboardApplication extends React.Component<{}, State> {
	state: State = {
		mode: 'top',
		splash: true
	}
	hub = new SalesEventHub()
	store = new EntityStore();

	componentDidMount() {
		// initialize services
		// ...
		this.hub.connect();
		this.hub.registerSalesEventListener(async (e) => {
				let user = await this.store.getUser(e.userId)
				let product = await this.store.getProduct(e.productId)
				console.log('User', user.name, 'sold', product.name, 'with subscription length', e.duration)
		})
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

					{splash && <SplashModal />}
				</div>
			</>
		)
	}
}
