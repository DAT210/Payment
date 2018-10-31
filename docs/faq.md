# FAQ

## A customer has placed an order, and I want to charge the customer.
> We first need the order information, and then you can redirect the customer to one of our pages.


1. Send a POST request to ```/payments``` with a JSON body using the following format:

		{
			"customer_ID":	int,
			"order_ID":	int,
			"delivery":
			{
				"price":	real,
				"method":	string,
				"est_time":	string,
				"address":	string
			},
			"ordered":
			[
				{ 
					"name":		string,
					"id":		int,
					"price":	real,
					"amount":	int
				}
			]
		}


2. If you recieved a response with status 400, you need to inspect the error message to see what's wrong. If the status is 201 you can redirect the user to our page by sending them to ```/payment-pages/:Order_ID?page=payment```. They'll be shown a html page where they can pay for their order.
