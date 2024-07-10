function changeQuantity(cartId, productId, count, userId) {
    
  let quantity = parseInt(document.getElementById(productId).innerHTML);
  count = parseInt(count);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      user: userId,
      cart: cartId,
      product: productId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeProduct) {
        alert("Product removed form cart!");
        location.reload();
      } else {
        document.getElementById(productId).innerHTML = quantity + count;
        document.getElementById("total").innerHTML = response.total;
      }
    },
  });
}

function addToCart(productId) {
  $.ajax({
    url: "/add-to-cart/" + productId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
    },
  });
}

function deleteCartItem(cartId, productId, count) {
  let quantity = parseInt(document.getElementById(productId).innerHTML);
  count = parseInt(count);
  $.ajax({
    url: "/delete-cart-item",
    data: {
      cart: cartId,
      product: productId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      if (response.removeProduct) {
        location.reload();
      }
    },
  });
}
