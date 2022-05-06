import React from "react";
import { BackendService, Product, SalesEvent, User } from "../../services/backend";

interface Props {
	event: { user: User; product: Product };
}

export class SplashModal extends React.Component<Props> {
	backendService = BackendService.Instance;

	render() {
		return (
			// Need to add a key to make react rerender the splash, and therefore trigger the timeout animation
			<div className="splash" key={Date.now()}>
				<p>{this.props.event.user.name} sold {this.props.event.product.name}</p>
				<span className="timeout"></span>
			</div>
		)
	}
}