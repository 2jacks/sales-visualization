let map
let geocoder
let markersCluster

let purchases = []
let customers = []
let years

function initMap() {
  geocoder = new google.maps.Geocoder()
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 54.740709, lng: 55.899675 },
    zoom: 5,
    mapId: '5b6665488abff2f5',
  })
}

function YearControl(year, controlDiv, map) {
  const controlUI = document.createElement('div')
  controlUI.style.backgroundColor = '#fff'
  controlUI.style.border = '2px solid #fff'
  controlUI.style.borderRadius = '3px'
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)'
  controlUI.style.cursor = 'pointer'
  controlUI.style.marginTop = '8px'
  controlUI.style.marginBottom = '22px'
  controlUI.style.marginRight = '10px'
  controlUI.style.textAlign = 'center'
  controlUI.title = 'Click to recenter the map'
  controlDiv.appendChild(controlUI)
  // Set CSS for the control interior.
  const controlText = document.createElement('div')
  controlText.style.color = 'rgb(25,25,25)'
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif'
  controlText.style.fontSize = '16px'
  controlText.style.lineHeight = '38px'
  controlText.style.paddingLeft = '5px'
  controlText.style.paddingRight = '5px'
  controlText.innerHTML = '20' + year.toString()
  controlUI.appendChild(controlText)
  // Setup the click event listeners: simply set the map to Chicago.
  let yearShort = year
  let yearFull = '20' + year.toString()
  yearFull = parseInt(yearFull)
  controlUI.addEventListener('click', () => {
    sortCustomersByYear(yearShort)
  })
}

class Customer {
  constructor(address, purchases) {
    this.address = address
    this.name = purchases[0].customer
    this.geo = purchases[0].geo
    this.purchases = purchases
    this.infoWindow
  }

  createSimpleMarker() {
    let isAllPurchasesPayed = this.purchases.every(
      (purchase) => purchase.payment_status == 'Оплачено'
    )
    const svgMarker = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isAllPurchasesPayed ? 'green' : 'red',
      fillOpacity: 0.6,
      strokeWeight: 0,
      rotation: 0,
      scale: 10,
    }

    this.simpleMarker = new google.maps.Marker({
      position: this.geo,

      icon: svgMarker,
    })
    this.simpleMarker.addListener('click', () => {
      this.infoWindow.open({
        anchor: this.simpleMarker,
        map,
        shouldFocus: false,
      })
    })
  }
  showSimpleMarker() {
    this.simpleMarker.setMap(map)
  }
  hideSimpleMarker() {
    this.simpleMarker.setMap(null)
  }

  createInfoWindow() {
    let html = []
    html.push(`<h1>${this.name}</h1>
    <h3>${this.address}</h3>`)
    for (let purchase of this.purchases) {
      html.push(purchase.card)
    }
    let contentString = html.join('')
    this.infoWindow = new google.maps.InfoWindow({
      content: contentString,
    })
  }
}

class Purchase {
  constructor(purchase) {
    ;(this.customer = purchase.customer),
      (this.address = purchase.address),
      (this.date = purchase.date),
      (this.product = purchase.product),
      (this.cost = purchase.cost),
      (this.quantity = purchase.quantity),
      (this.total = purchase.total),
      (this.payment_status = purchase.payment_status),
      (this.geo = purchase.geo),
      (this.card = `
            <div class="purchase">
          <div class="info-row">
            <span class="info-title">Дата покупки: </span>
            <span class="info-body">${purchase.date}</span>
          </div>
 
          <div class="info-row">
            <span class="info-title">Товар: </span>
            <span class="info-body">${purchase.product}</span>
          </div>
          <div class="info-row">
            <span class="info-title">Количество: </span>
            <span class="info-body">${purchase.quantity}</span>
          </div>
          <div class="info-row">
            <span class="info-title">Сумма заказа: </span>
            <span class="info-body">${purchase.total}</span>
          </div>
          <div class="info-row">
            <span class="info-title">Статус оплаты: </span>
            <span class="info-body ${
              this.payment_status == 'Оплачено'
                ? 'payment-status--payed'
                : 'payment-status--not-payed'
            }">${purchase.payment_status}</span>
          </div>
      </div>
      `)
  }
  get year() {
    let date = this.date.split('/')
    return parseInt(date[2])
  }
}

var firebaseConfig = {
  apiKey: 'AIzaSyDixbj72fyI4NdA4yIKx4vd0ZneOpybHdg',
  authDomain: 'sales-visualization-2c172.firebaseapp.com',
  databaseURL: 'https://sales-visualization-2c172-default-rtdb.firebaseio.com',
  projectId: 'sales-visualization-2c172',
  storageBucket: 'sales-visualization-2c172.appspot.com',
  messagingSenderId: '681105707100',
  appId: '1:681105707100:web:23132dbcdd8cdae0d7d699',
}

firebase.initializeApp(firebaseConfig)
const dbRef = firebase.database().ref()
dbRef
  .child('Sales')
  .get()
  .then((snapshot) => {
    if (snapshot.exists()) {
      purchases = snapshot.val()
      purchases = purchases.map((purchase) => {
        return new Purchase(purchase)
      })
      years = extractYears(purchases)
      createYearControls(years)

      processPurchases(purchases)
    } else {
      console.log('No data available')
    }
  })
  .catch((error) => {
    console.error(error)
  })

function sortPurchasesByCustomers(purchases) {
  let setOfCustomers = new Set()
  for (let i of purchases) {
    // Если адреса будут отличаться записью - будут дубликаты. Можно сначала провести геокодирование, и коорды писать в Set адресов
    setOfCustomers.add(i.address)
  }

  setOfCustomers.forEach((address) => {
    let matchingPurchases = purchases.filter(
      (purchase) => purchase.address == address
    )

    customers.push(new Customer(address, matchingPurchases))
  })
}

function clusterMarkers(customers) {
  let markers = []
  for (let customer of customers) {
    if (
      customer.simpleMarker.map != null &&
      customer.simpleMarker.map != undefined
    ) {
      markers.push(customer.simpleMarker)
    }
  }

  return new MarkerClusterer(map, markers, {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  })
}

function processPurchases(purchases) {
  sortPurchasesByCustomers(purchases)
  for (let customer of customers) {
    customer.createInfoWindow()
    customer.createSimpleMarker()
    customer.showSimpleMarker()
  }
  markersCluster = clusterMarkers(customers)
}

function sortCustomersByYear(year) {
  // Отсеяли покупателей, которые вообще не покупали в указанный год
  for (let customer of customers) {
    let havePurchaseInThisYear = customer.purchases.some(
      (purchase) => purchase.year == year
    )
    if (!havePurchaseInThisYear) {
      customer.hideSimpleMarker()
      markersCluster.removeMarker(customer.simpleMarker)
    }
  }
}

function extractYears(purchases) {
  let years = new Set()
  for (let purchase of purchases) {
    years.add(purchase.year)
  }
  return years
}

function createYearControls(years) {
  for (let year of years) {
    let yearControlDiv = document.createElement('div')
    YearControl(year, yearControlDiv, map)
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(yearControlDiv)
  }
}

// function visualizePurchases() {}
