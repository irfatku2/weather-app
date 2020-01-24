import moment from "moment";

const URL = 'http://api.openweathermap.org/data/2.5';
const API_KEY = 'a2a08d5673da18a7a2c40bef27b3173c';

const ul = document.getElementById('cities');
const er = document.getElementById("error");
const card = document.getElementById('weather-card');
let favourites = [];
let currentCity;
let daysArr = [];

export class Weather {
    static getCurrent(city) {
        return fetch(`${URL}/weather?q=${city}&mode=json&units=metric&APPID=${API_KEY}`)
        .then(res => res.json())
        .then(res => {
            if (res.cod == 200) {
                render(res);
                currentCity = res.name;
                card.style.display = 'block';
            } else if(res.cod == 404) {
                onError(res);
            } else {
                console.error(res.message);
            }
        })
    }

    static getFuture(city) {
        return fetch(`${URL}/forecast?q=${city}&mode=json&units=metric&APPID=${API_KEY}`)
        .then(res => res.json())
        .then(res => {
            if (res.cod == 200) {
                renderDays(res);
            } else {
                console.error(res.message);
            }
        })
    }

    static addToFavourite() {
        favourites = getFromLocalStorage();
        if (currentCity && favourites.indexOf(currentCity) === -1) {
            favourites.push(currentCity);
            localStorage.setItem('favourites', JSON.stringify(favourites));
            createFavouriteCity(currentCity);
        }
    }

    static renderFavourites() {
        favourites = getFromLocalStorage();
        if (favourites.length) {
            favourites.forEach(fav => {
                createFavouriteCity(fav);
            });
        }
    }
}

function render(weather) {
    if (er.firstChild){
        er.firstChild.remove()
    }

    document.getElementById('city-name').innerText = weather.name;
    document.getElementById('temp').innerText = Math.round(weather.main.temp);
}

function renderDays(days) {

    let tempArr = days.list.reduce((sum, curr) => {
        let currDate = new Date(curr.dt_txt);
        let tmp = sum.find(day => day.date === currDate.toDateString());
        if (tmp == undefined) {
            tmp = {};
            tmp.date = currDate.toDateString();
            tmp.tempreture = [];
            tmp.weather = [];
            sum.push(tmp);
        }
        tmp.tempreture.push(curr.main);
        tmp.weather.push(curr.weather[0]);

        return sum;
    }, []);

    tempArr = tempArr.map(day => {
        const min = Math.round(day.tempreture.reduce((min, b) => Math.min(min, b.temp_min), day.tempreture[0].temp_min));
        const max = Math.round(day.tempreture.reduce((max, b) => Math.max(max, b.temp_max), day.tempreture[0].temp_max));
        return {...day, min: min, max: max}
    });

    const ul = document.getElementById('days');
    ul.innerHTML = "";

    tempArr.forEach(el => {        
        const li = document.createElement('li');
        const day = document.createElement('span');
        const temp = document.createElement('span');
        const img = document.createElement('span');
        img.style.cssText = `
        background: url(\'http://openweathermap.org/img/wn/${el.weather[0].icon}.png\') center no-repeat; 
        width: 36px; 
        height: 32px; 
        display: block;
        margin-left: 15px`;
        const dayOfTheWeek = moment(el.date).format('dddd') === moment().format('dddd')
            ? 'Today' : moment(el.date).format('dddd');

        day.append(dayOfTheWeek);
        temp.append(`${el.min} ~ ${el.max}`);
        ul.appendChild(li).append(day, temp, img);
    });
}

function onError(error) {
    let html = document.createElement("p");
    html.append(error.message);
    er.appendChild(html);
}

function createFavouriteCity(cityName) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    const deleteBtn = document.createElement("i");
    deleteBtn.classList.add("delete-icon");
    
    li.appendChild(span).append(cityName);
    ul.appendChild(li).append(deleteBtn);
    listenGetWeather(li);
    listenDeleteCity(deleteBtn);
}

function listenDeleteCity(element) {
    element.addEventListener("click", (event) => {
        const index = favourites.indexOf(event.target.parentElement.firstChild.innerText);
        if(index !== -1) {
            favourites.splice(index, 1);
            localStorage.setItem('favourites', JSON.stringify(favourites));
            element.parentElement.remove();
            event.stopPropagation();
        }   
    });
}

function listenGetWeather(element) {
    element.addEventListener("click", (event) => {
        Weather.getCurrent(event.target.innerText);
        Weather.getFuture(event.target.innerText);
        event.stopPropagation();
    });
}

function getFromLocalStorage() {
    let favourites = JSON.parse(localStorage.getItem('favourites'));
    return favourites ? favourites : [];
}