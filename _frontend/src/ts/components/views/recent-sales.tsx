import React from "react";
import { BackendService, Product, User } from "../../services/backend";

interface ExtendedSalesEvent {
	type: 'sale';
	user: User;
	product: Product;
	duration: number;
}
interface State {
	sales: Array<ExtendedSalesEvent>;
}

export class RecentSalesView extends React.Component<{}, State> {
	state: State = {
		sales: [],
	}

	backendService = BackendService.Instance;

	componentDidMount() {
		this.backendService.registerSalesEventListener(async (event) => {
			const { userId, productId, duration } = event;

			// Map the sales event to the correct format
			const extendedSaleEvent: ExtendedSalesEvent = {
				type: 'sale',
				user: await this.backendService.getUser(userId),
				product: await this.backendService.getProduct(productId),
				duration,
			}

			// Update the state
			this.setState((state) => ({ sales: [extendedSaleEvent, ...state.sales].slice(0, 10) }));
		});
	}

	render() {
		return (
			<div>
				<h2>Recent sales</h2>
				<table className="table recent">
					<thead>
						<tr>
							<th>User</th>
							<th>Product</th>
							<th>Price</th>
							<th>Duration</th>
						</tr>
					</thead>
					<tbody>
						{this.state.sales.map(sale =>
							<tr>
								<td>{sale.user.name}</td>
								<td>{sale.product.name}</td>
								<td>{sale.product.unitPrice}</td>
								<td>{sale.duration}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		)
	}
}