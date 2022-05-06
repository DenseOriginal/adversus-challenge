import * as React from 'react';
import { RecentSalesView } from './views/recent-sales';
import { TopSalesView } from './views/top-sales';
import { SplashModal } from './widgets/splash-modal';
import { Sidebar } from './views/sidebar';
import { Header } from './views/header';
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
		// Start switching between the to tables
		setTimeout(this.switchMode.bind(this), this.state.mode === 'top' ? 60000 : 30000);

		// Start the listner for sales events
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
		// "Flip-Flop" the mode
		this.setState({ mode: this.state.mode === 'recent' ? 'top' : 'recent' });

		// Restart the timeout
		setTimeout(this.switchMode.bind(this), this.state.mode === 'top' ? 60000 : 30000);
	}

	// Variable to store the sales events that have yet to be displayed.
	splashQueue: SalesEvent[] = [];
	handleSalesEvent(event: SalesEvent) {
		// Push the new event into the queue
		this.splashQueue.push(event);
		
		// If there isn't already a splash up, then we need to kickstart the splash timer
		// Otherwise if it's already going, it will automaticly show the next splash message
		if (!this.state.splash) this.displaySplash.bind(this)();
	}

	async displaySplash() {
		// Get the sale event that's next in line
		const mostRecentSale = this.splashQueue.shift();

		// If theres no more sales events in the queue
		// Then stop displaying the splash
		if (!mostRecentSale) {
			return this.setState({
				splash: false,
				mostRecentSale: undefined,
			});
		}


		// Set the appriopiate state
		this.setState({
			splash: true,
			mostRecentSale: {
				// Fetch the user and product for the splash
				user: await this.backendService.getUser(mostRecentSale.userId),
				product: await this.backendService.getProduct(mostRecentSale.productId),
			},
		});

		// Remove or show next splash in 5000 ms (5 seconds)
		setTimeout(this.displaySplash.bind(this), 5000);
	}
}
