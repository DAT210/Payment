function navigateBackToOrderPage(){
  //// TODO: add function to take user back to order page
}

function navogateToChoosePayment(){
// TODO: Spør Christoffer
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
function navogateToPaymentPage(){

}

function navigateBackToChoosePaymentPage(){

}
