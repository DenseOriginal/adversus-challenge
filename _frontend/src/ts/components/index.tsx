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

	componentDidMount(): void {
		setTimeout(this.switchMode.bind(this), this.state.mode === 'top' ? 5000 : 5000);
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

	switchMode() {
		this.setState({ mode: this.state.mode === 'recent' ? 'top' : 'recent' })
		setTimeout(this.switchMode.bind(this), this.state.mode === 'top' ? 5000 : 5000);
	}
}
