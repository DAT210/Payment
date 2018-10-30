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

function paypal-payment(){
  	// Render the PayPal button
	paypal.Button.render({
    // Set your environment
    env: 'sandbox', // sandbox | production
  
    // Specify the style of the button
    style: {
      layout: 'vertical',  // horizontal | vertical
      size:   'medium',    // medium | large | responsive
      shape:  'rect',      // pill | rect
      color:  'black'       // gold | blue | silver | white | black
    },
  
    // Specify allowed and disallowed funding sources
    //
    // Options:
    // - paypal.FUNDING.CARD
    // - paypal.FUNDING.CREDIT
    // - paypal.FUNDING.ELV
    funding: {
      allowed: [
      paypal.FUNDING.CARD,
      paypal.FUNDING.CREDIT
      ],
      disallowed: []
    },
  
    // PayPal Client IDs - replace with your own
    // Create a PayPal app: https://developer.paypal.com/developer/applications/create
    client: {
      sandbox: 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R',
      production: '<insert production client id>'
    },
  
    payment: function (data, actions) {
      return actions.payment.create({
      payment: {
        transactions: [
        {
          amount: {
          total: '{{ FinalPrice }}', //need to insert updated value for total ammount
          currency: 'NOK'
          }
        }
        ]
      }
      });
    },
  
    onAuthorize: function (data, actions) {
      return actions.payment.execute()
      .then(function () {
        function reqListener () {
    console.log(this.responseText);
  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("PUT", '/paypal-payment/{{OrderID}}');
  oReq.send();
        window.alert('Payment Complete!');
      });
    }
    }, '#paypalbtn');
}

function cashPayment(){

    document.getElementById("cashpay-button").disabled=true;
    
    document.getElementById("startpay").innerHTML="Payment in process, please wait for the waiter to collect payment..."
  

var intervallet=setInterval(function Cash_Pay(){
    
    var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
  
  if(xhttp.responseText=="1"){
    clearInterval(intervallet);
    document.getElementById("payed").innerHTML="Payment complete"
    
   }
   
}

};

xhttp.open("GET", "/cash-payment/{{Order_ID}}");
xhttp.send();	
},1000);
  

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
