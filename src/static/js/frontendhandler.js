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
      window.location.href = '/payment-pages/{{ OrderID }}?page=choosepay';
    }
  }
}
function navigateToPaymentPage(){

}

function navigateBackToChoosePaymentPage(){
	
}

function getCouponInformation(couponID) {
	return { couponID: couponID, type: 0, value: 10 };
}

function calculateCouponDiscount(couponID) {
	coupon = getCouponInformation(couponID);
	
	orderid = {{ OrderID }};
	

	let sum = document.getElementById("sum");
	let tips = document.getElementById("tips");
	let delivery = document.getElementById("delivery");
	let total = document.getElementById("total");
	
	let new_sum = parseFloat(sum.value, 10);
	if (coupon.type == 0) {
		new_sum *= (100 - coupon.value) / 100;
	} else if (coupon.type == 1) {
		new_sum -= coupon.value;
	}
	
	delivery_price = 0;
	if (delivery != null) {
		delivery_price = parseFloat(delivery.value, 10);
	}

	tips_value = parseFloat(tips.value, 10);
	if (tips_value < 0) {
		tips_value = 0;
	}

	sum.value = new_sum;
	total.value = tips_value + delivery_price + new_sum;
}
