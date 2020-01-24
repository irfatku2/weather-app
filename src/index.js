import "./style.css"
import { Weather } from "./weather";

document.addEventListener("DOMContentLoaded", onPageLoaded);

function onPageLoaded() {
    let searchBtn = document.getElementById('search-btn');
    let input = document.getElementById('city');
    let favouriteBtn = document.getElementById('favouriteBtn');
    
    window.addEventListener('load', Weather.renderFavourites);
    searchBtn.addEventListener('click', searchCity);
    favouriteBtn.addEventListener('click', Weather.addToFavourite);
    
    function searchCity(event) {
        event.preventDefault();
        searchBtn.disabled = true;
        Weather.getCurrent(input.value.trim()).then(() => {
            input.value = '';
            searchBtn.disabled = false;
        });
        Weather.getFuture(input.value.trim())
    }
}

