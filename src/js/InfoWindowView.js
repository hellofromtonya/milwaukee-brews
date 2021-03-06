/**
 * The InfoWindow which appears above a selected
 * marker requires addition rendering to build
 * the view within it.
 *
 * This class handles the view rendering.
 */
class InfoWindowView {
  /**
   * @description Instantiate the Info Window
   * @param {object} map Instance of the Google Map
   * @method
   */
  constructor(map) {
    this.map = map;
    this.infoWindow = new google.maps.InfoWindow({
      maxWidth: 300,
    });
  }

  /**
   * @description Close the InfoWindow
   * @method
   */
  close() {
    this.infoWindow.close();
  }

  /**
   * @description Render the InfoWindow
   * @param {object} placeModel Brew house's model
   * @param {bool} hasError When true, an error occurred.
   * @method
   */
  render(placeModel, hasError = false) {
    this.infoWindow.close();
    this.infoWindow.marker = placeModel.marker;
    this.infoWindow.setContent(this.buildHTML(placeModel, hasError));
    this.infoWindow.open(this.map, placeModel.marker);
  }

  /**
   * @description Render the initial info window with the spinner.
   * @param {object} placeModel Brew house's model
   * @returns {string}
   */
  renderSpinner(placeModel) {
    this.infoWindow.close();
    this.infoWindow.marker = placeModel.marker;
    this.infoWindow.setContent(this.buildSpinnerHTML(placeModel));
    this.infoWindow.open(this.map, placeModel.marker);
  }

  /**
   * @description Build the spinner (wait) HTML
   * @param {object} placeModel Brew house's model
   * @returns {string}
   */
  buildSpinnerHTML(placeModel) {
    return `<div class="brewhouse-info-container">
          <h2>${placeModel.title()}</h2>
          <div class="brewhouse-info">
            <div class="brewhouse-info-content">
                <p>Please wait as we connect Yelp...</p>
            </div>
            <div class="brewhouse-info-content">
                <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>`;
  }

  /**
   * @description Build the InfoWindow.
   * @param {object} placeModel Brew house's model
   * @param {bool} hasError When true, an error occurred.
   * @returns {string}
   */
  buildHTML(placeModel, hasError = false) {
    let links = `<a href="${placeModel.url}" target="_blank">website</a>`;

    let tags = '<i class="fa fa-beer" aria-hidden="true"></i>';
    if (placeModel.tag().includes('restaurant')) {
      tags += '<i class="fa fa-cutlery" aria-hidden="true"></i>';
    }
    if (placeModel.tag().includes('live music')) {
      tags += '<i class="fa fa-music" aria-hidden="true"></i>';
    }

    let html = `<div class="brewhouse-info-container">
          <h2>${placeModel.title()}</h2>
          <div class="brewhouse-info">
            <div class="brewhouse-info-content">
              <p class="brewhouse-tags">${tags}</p>
              <p><strong>My Review:</strong> ${placeModel.marker.info}</p>
            </div>
            <div class="brewhouse-info-content">
                <p>${placeModel.address}</p>`;

    if (placeModel.hasYelpData()) {
      html += `<p>Yelp Rating: ${placeModel.yelpData.rating}</p>`;
      links += ` | <a href="${placeModel.yelpData.url}" target="_blank">Yelp</a>`;
    } else if (hasError) {
      html += '<p><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Whoopsie, an error happened when contacting Yelp.</p>';
    } else {
      html += '<p><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Whoops, something happened on our way to get Yelp information for you.</p>';
    }

    html += `${links}</div>
          </div>
        </div>`;

    return html;
  }
}