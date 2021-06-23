"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var map;
var geocoder;
var markersCluster;
var purchases = [];
var customers = [];
var years;

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 54.740709,
      lng: 55.899675
    },
    zoom: 5,
    mapId: '5b6665488abff2f5'
  });
}

function YearControl(year, controlDiv, map) {
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginTop = '8px';
  controlUI.style.marginBottom = '22px';
  controlUI.style.marginRight = '10px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI); // Set CSS for the control interior.

  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '20' + year.toString();
  controlUI.appendChild(controlText); // Setup the click event listeners: simply set the map to Chicago.

  var yearShort = year;
  var yearFull = '20' + year.toString();
  yearFull = parseInt(yearFull);
  controlUI.addEventListener('click', function () {
    sortCustomersByYear(yearShort);
  });
}

var Customer = /*#__PURE__*/function () {
  function Customer(address, purchases) {
    _classCallCheck(this, Customer);

    this.address = address;
    this.name = purchases[0].customer;
    this.geo = purchases[0].geo;
    this.purchases = purchases;
    this.infoWindow;
  }

  _createClass(Customer, [{
    key: "createSimpleMarker",
    value: function createSimpleMarker() {
      var _this = this;

      var isAllPurchasesPayed = this.purchases.every(function (purchase) {
        return purchase.payment_status == 'Оплачено';
      });
      var svgMarker = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: isAllPurchasesPayed ? 'green' : 'red',
        fillOpacity: 0.6,
        strokeWeight: 0,
        rotation: 0,
        scale: 10
      };
      this.simpleMarker = new google.maps.Marker({
        position: this.geo,
        icon: svgMarker
      });
      this.simpleMarker.addListener('click', function () {
        _this.infoWindow.open({
          anchor: _this.simpleMarker,
          map: map,
          shouldFocus: false
        });
      });
    }
  }, {
    key: "showSimpleMarker",
    value: function showSimpleMarker() {
      this.simpleMarker.setMap(map);
    }
  }, {
    key: "hideSimpleMarker",
    value: function hideSimpleMarker() {
      this.simpleMarker.setMap(null);
    }
  }, {
    key: "createInfoWindow",
    value: function createInfoWindow() {
      var html = [];
      html.push("<h1>".concat(this.name, "</h1>\n    <h3>").concat(this.address, "</h3>"));

      var _iterator = _createForOfIteratorHelper(this.purchases),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var purchase = _step.value;
          html.push(purchase.card);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var contentString = html.join('');
      this.infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
    }
  }]);

  return Customer;
}();

var Purchase = /*#__PURE__*/function () {
  function Purchase(purchase) {
    _classCallCheck(this, Purchase);

    ;
    this.customer = purchase.customer, this.address = purchase.address, this.date = purchase.date, this.product = purchase.product, this.cost = purchase.cost, this.quantity = purchase.quantity, this.total = purchase.total, this.payment_status = purchase.payment_status, this.geo = purchase.geo, this.card = "\n            <div class=\"purchase\">\n          <div class=\"info-row\">\n            <span class=\"info-title\">\u0414\u0430\u0442\u0430 \u043F\u043E\u043A\u0443\u043F\u043A\u0438: </span>\n            <span class=\"info-body\">".concat(purchase.date, "</span>\n          </div>\n \n          <div class=\"info-row\">\n            <span class=\"info-title\">\u0422\u043E\u0432\u0430\u0440: </span>\n            <span class=\"info-body\">").concat(purchase.product, "</span>\n          </div>\n          <div class=\"info-row\">\n            <span class=\"info-title\">\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E: </span>\n            <span class=\"info-body\">").concat(purchase.quantity, "</span>\n          </div>\n          <div class=\"info-row\">\n            <span class=\"info-title\">\u0421\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430: </span>\n            <span class=\"info-body\">").concat(purchase.total, "</span>\n          </div>\n          <div class=\"info-row\">\n            <span class=\"info-title\">\u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u043F\u043B\u0430\u0442\u044B: </span>\n            <span class=\"info-body ").concat(this.payment_status == 'Оплачено' ? 'payment-status--payed' : 'payment-status--not-payed', "\">").concat(purchase.payment_status, "</span>\n          </div>\n      </div>\n      ");
  }

  _createClass(Purchase, [{
    key: "year",
    get: function get() {
      var date = this.date.split('/');
      return parseInt(date[2]);
    }
  }]);

  return Purchase;
}();

var firebaseConfig = {
  apiKey: 'AIzaSyDixbj72fyI4NdA4yIKx4vd0ZneOpybHdg',
  authDomain: 'sales-visualization-2c172.firebaseapp.com',
  databaseURL: 'https://sales-visualization-2c172-default-rtdb.firebaseio.com',
  projectId: 'sales-visualization-2c172',
  storageBucket: 'sales-visualization-2c172.appspot.com',
  messagingSenderId: '681105707100',
  appId: '1:681105707100:web:23132dbcdd8cdae0d7d699'
};
firebase.initializeApp(firebaseConfig);
var dbRef = firebase.database().ref();
dbRef.child('Sales').get().then(function (snapshot) {
  if (snapshot.exists()) {
    purchases = snapshot.val();
    purchases = purchases.map(function (purchase) {
      return new Purchase(purchase);
    });
    years = extractYears(purchases);
    createYearControls(years);
    processPurchases(purchases);
  } else {
    console.log('No data available');
  }
})["catch"](function (error) {
  console.error(error);
});

function sortPurchasesByCustomers(purchases) {
  var setOfCustomers = new Set();

  var _iterator2 = _createForOfIteratorHelper(purchases),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var i = _step2.value;
      // Если адреса будут отличаться записью - будут дубликаты. Можно сначала провести геокодирование, и коорды писать в Set адресов
      setOfCustomers.add(i.address);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  setOfCustomers.forEach(function (address) {
    var matchingPurchases = purchases.filter(function (purchase) {
      return purchase.address == address;
    });
    customers.push(new Customer(address, matchingPurchases));
  });
}

function clusterMarkers(customers) {
  var markers = [];

  var _iterator3 = _createForOfIteratorHelper(customers),
      _step3;

  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var customer = _step3.value;

      if (customer.simpleMarker.map != null && customer.simpleMarker.map != undefined) {
        markers.push(customer.simpleMarker);
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }

  return new MarkerClusterer(map, markers, {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
  });
}

function processPurchases(purchases) {
  sortPurchasesByCustomers(purchases);

  var _iterator4 = _createForOfIteratorHelper(customers),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var customer = _step4.value;
      customer.createInfoWindow();
      customer.createSimpleMarker();
      customer.showSimpleMarker();
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }

  markersCluster = clusterMarkers(customers);
}

function sortCustomersByYear(year) {
  // Отсеяли покупателей, которые вообще не покупали в указанный год
  var _iterator5 = _createForOfIteratorHelper(customers),
      _step5;

  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var customer = _step5.value;
      var havePurchaseInThisYear = customer.purchases.some(function (purchase) {
        return purchase.year == year;
      });

      if (!havePurchaseInThisYear) {
        customer.hideSimpleMarker();
        markersCluster.removeMarker(customer.simpleMarker);
      }
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
}

function extractYears(purchases) {
  var years = new Set();

  var _iterator6 = _createForOfIteratorHelper(purchases),
      _step6;

  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var purchase = _step6.value;
      years.add(purchase.year);
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }

  return years;
}

function createYearControls(years) {
  var _iterator7 = _createForOfIteratorHelper(years),
      _step7;

  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var year = _step7.value;
      var yearControlDiv = document.createElement('div');
      YearControl(year, yearControlDiv, map);
      map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(yearControlDiv);
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
} // function visualizePurchases() {}