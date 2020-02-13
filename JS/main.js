const header = document.querySelector('.header')
const desktopHeader = document.querySelector('.header-desktop')

// Place header content into desktopHeader
desktopHeader.innerHTML = header.innerHTML

// Hides desktopHeader when header comes into view
inView('.header')
  .on('enter', el => desktopHeader.classList.remove('visible'))
  .on('exit', el => desktopHeader.classList.add('visible'))

// Enable tilt.js library on all images  
VanillaTilt.init(document.querySelectorAll('.image'), {
  max: 25,
  speed: 400
})

// Add 'visible' class to fade in images as they come in view
inView('.fade')
  .on('enter', img => img.classList.add('visible'))
  .on('exit', img => img.classList.remove('visible'))

const registerButton = document.querySelector('.register-button')
// Add 'slide-up' class to front element upon clicking registerButton
registerButton.addEventListener('click', event => {
  frontEl = document.querySelector('.front')
  frontEl.classList.add('slide-up')
})

// Create stripe client
const stripe = Stripe('pk_test_fxwhlQlVDPpoq2Rb3GNbnkQz00dpbybeIe')

// Create stripe elements
const elements = stripe.elements()

// Use custom styling when creating stripe elements
const style = {
  base: {
    fontSize: '16px',
    color: '#32325d'
  }
}
// Create card Element.
const card = elements.create('card', {style: style})
card.mount('#card-element')

// Create token or display error upon form submission
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors')
  if (event.error) {
    displayError.textContent = event.error.message
  } else {
    displayError.textContent = ''
  }
})

// Handle form submission
const form = document.getElementById('payment-form')
const errorElement = document.getElementById('card-errors')

form.addEventListener('submit', function(event) {
  event.preventDefault()
  // Lock the form
  form.classList.add('processing')
  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Unlock the form when there is an error
       form.classList.add('processing')
      // Inform the customer that there was an error
      errorElement.textContent = result.error.message
    } else {
      // Send the token to server
      stripeTokenHandler(result.token)
    }
  })
})

// Making our payment
function stripeTokenHandler(token) {
  // Make variables name and email
  const nameEl = document.querySelector('#name')
  const emailEl = document.querySelector('#email')
  // Grab form action url from the form
  const backendUrl = form.getAttribute('action')

  // Send data off to the url using fetch
  fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // Ensure that data is ready/secure to be sent over
    body: JSON.stringify({
      order: {
        stripe_token: token.id,
        // Take value from name element
        name: nameEl.value,
        // Take value from email element
        email: emailEl.value
      }
    })
  })
  
  // Turn response into json
    .then(response => response.json())
    .then(data => {
      // Verify that an order has been made
      if (data.order) {
        const order = data.order
        // Tell server user payment is successful 
        form.querySelector('.form-title').textContent = 'Payment successful!'
        form.querySelector('.form-fields').textContent = `
          Thank you ${order.name}, your payment was successful and we have sent an email receipt to ${order.email}
        `
        form.classList.remove('processing')
      }
    })
    // If there is an error, display error message
    .catch(error => {
      errorElement.textContent = `There was an error with payment, please try again or contact us at help@goodtim.es`
      form.classList.remove('processing')
    })
}

// Listen to clicking on each anchor tag to scroll it into view
const anchors = document.querySelectorAll('a')
anchors.forEach(anchor => {
  anchor.addEventListener('click', event => {
    const href = anchor.getAttribute('href')
    if (href.charAt(0) === '#') {
      event.preventDefault()
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
})
