import React from "react";
import { BackendService } from "../../services/backend";

interface UserSales {
	id: number;
	name: string;
	totalSales: number;
}

interface State {
	sales: Array<UserSales>; // This should be a sorted array of all the sales, with the highest first
	people: Map<number, UserSales>;
}

export class TopSalesView extends React.Component<{}, State> {
	state: State = {
		sales: [],
		people: new Map<number, UserSales>(),
	}

	backendService = BackendService.Instance;

	componentDidMount() {
		this.backendService.registerSalesEventListener(async (event) => {
			const { userId, productId } = event;

			// Get the product price
			const { unitPrice } = await this.backendService.getProduct(productId);

			const { name } = await this.backendService.getUser(userId);

			// Update the component state
			this.setState((state) => {
				// Check if the user has made any sales before
				let user = state.people.get(userId);

				// If the users wasn't found, then create them
				if (!user) {
					user = {
						id: userId,
						name,
						totalSales: 0,
					};
				}

				// Add the new sale to their totalSales
				user.totalSales = precisionRound(user.totalSales + unitPrice, 2);

				// Set the updated (or new) object in the map
				state.people.set(userId, user);

				// Sort the sales array
				const users = [...state.people.values()].sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);

				return { people: state.people, sales: users }
			});
		});
	}

	render() {
		return (
			<div>
				<h2>Top sales leaderboard</h2>
				<table className="table top">
					<thead>
						<tr>
							<th>User</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{this.state.sales.map((sale, idx) =>
							<tr key={idx}>
								<td>{sale.name}</td>
								<td>{sale.totalSales}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		)
	}
}

// Fix for weird floating point fuckery
function precisionRound(number, precision) {
	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}