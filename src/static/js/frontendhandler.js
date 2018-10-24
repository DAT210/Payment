function navigateBackToOrderPage(){
  //// TODO: add function to take user back to order page
}

function navigateToChoosePayment(){
	let tips = parseInt(document.getElementById("tips").value, 10);
	let discount = 0; // Send request to Rewards to calculate coupon discount

	const http = new XMLHttpRequest();
	const url = '/payments/{{ OrderID }}';
	http.open('PATCH', url);
  	http.setRequestHeader('Content-type', 'application/json; charset=utf-8');

  	let json = JSON.parse('{}');
 	json.tips = tips;
 	json.discount = discount;

 	http.send(JSON.stringify(json));

	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			window.location.href = '/payment-pages/{{ OrderID }}?page=choosepay'
		}
	}
}

function navigateToPaymentPage(){

}

function navigateBackToChoosePaymentPage(){
}


var handler = StripeCheckout.configure({	
	key: '{{ stripe_publish_key  }}',
	image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
	locale: 'auto',
	token: function(token) {
		const http = new XMLHttpRequest();
		const url = '/stripe-payment/{{ OrderID }}';
		http.open('PUT', url);
		http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
		token.pricePaid = {{ TotalPrice }};
		http.send(JSON.stringify(token));
		http.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let json = JSON.parse(this.responseText);
				if (json.paymentComplete) {
					console.log("Payment complete");
					// TODO: Redirect user to a new page.
				} else { console.log("Payment not complete"); }
			}
		}

	}
});

document.getElementById('stripe-button').addEventListener('click', function(e) {
	handler.open({
		name: 'Stripe payment',
		currency: 'nok',	
		amount: {{ TotalPrice * 100 }}
	});
	e.preventDefault();
});

window.addEventListener('popstate', function() {
	handler.close();	
});
