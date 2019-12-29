const gallery = document.querySelector("#gallery");
const search = document.querySelector(".search-container");
const userList = [];

/**
 * Fetches user profiles (from the Random User API) for display in the employee directory app.
 * @async
 * @returns {Promise} JSON user profiles object
 */
async function fetchProfiles() {
    const response = await fetch('https://randomuser.me/api/?results=12&nat=us');
    return await response.json();
}


/**
 * Iterates through the fetched user Profiles and calls createCard() on each. 
 * Saves each profile in userList for later use in filtering results.
 *
 * @async
 */
async function createCards() {
    const users = await fetchProfiles();

    for (let i = 0; i < users.results.length; i++) {
        const user = users.results[i];
        createCard(user, i);
        userList.push(user);
    }
}

/**
 * Creates the HTML for a user profile card and appends it inside the "gallery" div.
 *
 * @param {object} user - user profile object
 * @param {number} i - index of the userList array. Used to create an id property 
 * for the modal window in displayClickedCard() and displayModal(). 
 */
function createCard(user, i){
    console.log(user);
    const cardHTML = `
        <div class="card-img-container">
            <img class="card-img" src=${user.picture.medium} alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="${user.name.first}-${user.name.last}" class="card-name cap">${user.name.first} ${user.name.last}</h3>
            <p class="card-text">${user.email}</p>
            <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
        </div>
    `;
    const card = document.createElement("div");
    card.className = "card";
    card.id = i.toString();

    card.innerHTML = cardHTML;
    gallery.appendChild(card);
}


/**
 * Called when a profile card is clicked. 
 * Iterates through parent nodes until the "card" div is found.
 * Then calls displayModal() using the card's index in the userList array.
 *
 * @param {event} event - the object clicked.
 */
function displayClickedCard (event) {
    let elem = event.target;
    for ( ; elem && elem != document; elem = elem.parentNode ) {
        if (elem.className === "card") {
            const index = Number(elem.id);
            displayModal(index);
        }
    }
}


/**
 * Displays the modal window. Uses the appropriate profile object in the userList 
 * array to generate the HTML for the modal and append it after the "gallery" div.
 * Adds event listeners to the modal's X and prev/next buttons.
 *
 * @param {number} cardIndex - Index of the user profile in the userList array.
 */
function displayModal(cardIndex) {
    /**
     * Reformats the date to "MM-DD-YYYY".
     *
     * @param {string} date - The date in original ISO format.
     * @returns {string} The date reformatted to "MM-DD-YYYY".
     */
    function formatDate(date){
        return `${date.slice(5,7)}-${date.slice(8,10)}-${date.slice(0,4)}`;
    }
    
    const user = userList[cardIndex];
    const date = formatDate(user.dob.date);
    const modal = document.createElement("div");
    modal.className = "modal-container";
    modal.innerHTML = `
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
            <div class="modal-info-container">
                <img class="modal-img" src=${user.picture.large} alt="profile picture">
                <h3 id="${user.name.first}-${user.name.last}" class="modal-name cap">${user.name.first} ${user.name.last}</h3>
                <p class="modal-text">${user.email}</p>
                <p class="modal-text cap">${user.location.city}</p>
                <hr>
                <p class="modal-text">${user.phone}</p>
                <p class="modal-text">${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state} ${user.location.postcode}</p>
                <p class="modal-text">Birthday: ${date}</p>
            </div>
        </div>

        <div class="modal-btn-container">
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        </div>
    `;
    gallery.after(modal);

    // Event listener for the "prev" button. Removes the current modal and displays 
    // one for the previous user in the userList array.
    document.querySelector("#modal-prev").addEventListener("click", () => {
        if (cardIndex > 0) {
            modal.remove();
            displayModal(cardIndex - 1);
        }
    });

    // Event listener for the "next" button. Removes the current modal and displays 
    // one for the previous user in the userList array.
    document.querySelector("#modal-next").addEventListener("click", () => {
        if (cardIndex < (userList.length - 1) ) {
            modal.remove();
            displayModal(cardIndex + 1);
        }
    });

    // Event listener for the close "X" button. Removes the current modal.
    document.querySelector("#modal-close-btn").addEventListener("click", () =>{
        modal.remove();
    });

}

/**
 * Creates the HTML for the search bar and appends it to the "search-container" div.
 */
function createSearchBar() {
    search.innerHTML = `
        <form id="search-form" action="#" method="get">
            <input type="search" id="search-input" class="search-input" placeholder="Search...">
            <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
        </form>
    `;
}

/**
 * Provides the functionality for the search bar. Displays users with a matching 
 * email address, first and/or last name, or city/state. 
 * Allows partial and case insensitive matches.
 */
function filterCards() {
    const searchTerm = document.querySelector("#search-input").value;
    gallery.innerHTML = "";
    
    for (let i = 0; i < userList.length; i++) {
        const user = userList[i];
        const userData = [user.email, `${user.name.first} ${user.name.last}`, `${user.location.city}, ${user.location.state}`];
        const regex = new RegExp(`${searchTerm}`,"i");
        let isChosen = false;
        userData.forEach((e)=>{
            if ( regex.test(e) ) isChosen = true;
        });
        if (isChosen) createCard(user, i);
    }
}

// Generates the Initial Page View
createSearchBar();
createCards();

// Event Listeners
document.querySelector("#search-input").addEventListener("keyup", filterCards);
document.querySelector("#search-form").addEventListener("submit", filterCards);
gallery.addEventListener("click", displayClickedCard);
