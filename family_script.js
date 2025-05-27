document.addEventListener('DOMContentLoaded', () => {
    const passwordSection = document.getElementById('password-section-family');
    const mainContent = document.getElementById('family-main-content');
    const passwordInput = document.getElementById('family-password-input');
    const passwordError = document.getElementById('family-password-error');
    const nextBirthdayInfo = document.getElementById('next-birthday-info');
    const birthdayTableBody = document.getElementById('birthday-table-body');
    const sortByNameButton = document.getElementById('sort-by-name');
    const sortByDateButton = document.getElementById('sort-by-date');
    const sortByDaysUntilButton = document.getElementById('sort-by-days-until'); // New button

    const CORRECT_FAMILY_PASSWORD = "Super";

    const birthdays = [
        { name: "Amish", day: 22, month: 2 }, { name: "Ashok", day: 4, month: 9 },
        { name: "Bella", day: 18, month: 2 }, { name: "Bob", day: 18, month: 11 },
        { name: "Caroline", day: 7, month: 3 }, { name: "Girish", day: 29, month: 9 },
        { name: "Ishan", day: 3, month: 3 }, { name: "Haji", day: 11, month: 5 },
        { name: "Jayshree", day: 9, month: 8 }, { name: "Jyotsna", day: 13, month: 12 },
        { name: "Karl", day: 18, month: 11 }, { name: "Krishna", day: 23, month: 3 },
        { name: "Lara", day: 27, month: 7 }, { name: "Manisha", day: 4, month: 12 },
        { name: "Maya", day: 1, month: 5 }, { name: "Milan", day: 6, month: 7 },
        { name: "Minal", day: 15, month: 7 }, { name: "Minaxi", day: 12, month: 8 },
        { name: "Narendra", day: 15, month: 3 }, { name: "Nishad", day: 12, month: 4 },
        { name: "Nora", day: 8, month: 11 }, { name: "Pim", day: 9, month: 2 },
        { name: "Raju", day: 27, month: 12 }, { name: "Rajul", day: 13, month: 11 },
        { name: "Rakesh", day: 1, month: 9 }, { name: "Remi", day: 30, month: 12 },
        { name: "Risha", day: 13, month: 6 }, { name: "Rohan", day: 20, month: 6 },
        { name: "Rohin", day: 2, month: 1 }, { name: "Samina", day: 1, month: 11 },
        { name: "Sapna", day: 6, month: 10 }, { name: "Sara", day: 11, month: 2 },
        { name: "Sarita", day: 10, month: 12 }, { name: "Seema", day: 20, month: 1 },
        { name: "Shan", day: 4, month: 9 }, { name: "Shamik", day: 15, month: 4 },
        { name: "Sheetal", day: 12, month: 6 }, { name: "Shonil", day: 24, month: 5 },
        { name: "Sudha", day: 24, month: 10 }, { name: "Vinita", day: 11, month: 3 },
        { name: "Vinod", day: 29, month: 5 }, { name: "Zane", day: 23, month: 9 },
        { name: "Zara", day: 29, month: 5 }
    ];

    // Attach event listener to the button defined in HTML
    const enterButton = passwordSection.querySelector('button');
    if (enterButton) {
        enterButton.onclick = checkFamilyPassword; // Assign function reference
    }
     // Also allow pressing Enter in password field
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                checkFamilyPassword();
            }
        });
    }


    function checkFamilyPassword() {
        if (passwordInput.value === CORRECT_FAMILY_PASSWORD) {
            passwordSection.style.display = 'none';
            mainContent.style.display = 'block';
            passwordError.textContent = '';
            initializePageContent();
        } else {
            passwordError.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
        }
    }

    function initializePageContent() {
        displayCurrentDate();
        calculateAndDisplayNextBirthdays();
        renderBirthdayTable(sortBirthdaysByName(birthdays)); // Initial sort by name
    }

    function displayCurrentDate() {
        const dateDisplayElement = document.getElementById('current-date-display');
        if (dateDisplayElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplayElement.textContent = `Today is: ${today.toLocaleDateString(undefined, options)}`;
        }
    }

    function getDaysUntil(day, month) {
        const today = new Date();
        const currentYear = today.getFullYear();
        let nextBirthdayDate = new Date(currentYear, month - 1, day);

        if (nextBirthdayDate < today) { // If birthday has passed this year, check next year's
            nextBirthdayDate.setFullYear(currentYear + 1);
        }
        
        const diffTime = Math.abs(nextBirthdayDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function calculateAndDisplayNextBirthdays() {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed

        let upcoming = birthdays.map(person => {
            return { ...person, daysUntil: getDaysUntil(person.day, person.month) };
        }).sort((a, b) => a.daysUntil - b.daysUntil);

        if (upcoming.length > 0) {
            const nextBdayDays = upcoming[0].daysUntil;
            const nextBdayPeople = upcoming.filter(p => p.daysUntil === nextBdayDays);
            
            let displayText = "";
            if (nextBdayDays === 0) {
                 displayText = `Today is ${nextBdayPeople.map(p => p.name).join(" & ")}'s birthday! 🎉`;
            } else {
                displayText = `${nextBdayPeople.map(p => p.name).join(" & ")}'s birthday is ${nextBdayDays === 1 ? 'tomorrow' : `in ${nextBdayDays} days`} (on ${nextBdayPeople[0].day}/${nextBdayPeople[0].month}).`;
            }
            nextBirthdayInfo.textContent = displayText;
        } else {
            nextBirthdayInfo.textContent = "No birthdays found.";
        }
    }
    
    function formatBirthDate(day, month) {
        const d = String(day).padStart(2, '0');
        const m = String(month).padStart(2, '0');
        return `${d}/${m}`;
    }

    function renderBirthdayTable(dataToRender) {
        birthdayTableBody.innerHTML = ''; // Clear existing rows
        dataToRender.forEach(person => {
            const row = birthdayTableBody.insertRow();
            row.insertCell().textContent = person.name;
            row.insertCell().textContent = formatBirthDate(person.day, person.month);
            row.insertCell().textContent = getDaysUntil(person.day, person.month); // Recalculate for display consistency
        });
    }

    function sortBirthdaysByName(data) {
        return [...data].sort((a, b) => a.name.localeCompare(b.name));
    }

    function sortBirthdaysByDate(data) {
        // Sort by month, then by day
        return [...data].sort((a, b) => {
            if (a.month !== b.month) {
                return a.month - b.month;
            }
            return a.day - b.day;
        });
    }
    
    // More sophisticated sort by next upcoming date
    function sortBirthdaysByDaysUntil(data) {
        return data.map(person => ({
            ...person,
            daysUntil: getDaysUntil(person.day, person.month)
        })).sort((a,b) => a.daysUntil - b.daysUntil);
    }


    if (sortByNameButton) {
        sortByNameButton.addEventListener('click', () => {
            renderBirthdayTable(sortBirthdaysByName(birthdays));
        });
    }

    if (sortByDateButton) {
        sortByDateButton.addEventListener('click', () => {
            // Sort by actual date order throughout the year
            renderBirthdayTable(sortBirthdaysByDate(birthdays));
        });
    }

    if (sortByDaysUntilButton) {
        sortByDaysUntilButton.addEventListener('click', () => {
            renderBirthdayTable(sortBirthdaysByDaysUntil(birthdays));
        });
    }
    
    // Add event listeners to table headers for sorting
    document.querySelectorAll('#birthday-table th').forEach(headerCell => {
        headerCell.addEventListener('click', () => {
            const sortKey = headerCell.dataset.sortKey;
            if (sortKey === 'name') {
                renderBirthdayTable(sortBirthdaysByName(birthdays));
            } else if (sortKey === 'birthDate') {
                 renderBirthdayTable(sortBirthdaysByDate(birthdays));
            } else if (sortKey === 'daysUntil') {
                renderBirthdayTable(sortBirthdaysByDaysUntil(birthdays));
            }
        });
    });


    // Initial check if already authenticated (e.g. if page was reloaded after password entry)
    // This simple example doesn't use sessionStorage for this, but could be added.
    // For now, password must be entered each time family_details.html is loaded.

});

// Expose checkFamilyPassword to global scope for HTML onclick
window.checkFamilyPassword = () => {
    const passwordInput = document.getElementById('family-password-input');
    // This is a bit redundant as the main logic is inside DOMContentLoaded,
    // but ensures the button click works if script is loaded weirdly.
    // The event listener added in DOMContentLoaded is preferred.
    // For simplicity, we'll rely on the DOMContentLoaded one.
    // This global function can be called by the button if needed,
    // but the event listener is more robust.
    // To make it work, we'd need to move passwordInput and other vars to global or pass them.
    // Let's ensure the DOMContentLoaded listener handles it.
    // The button's onclick in HTML is `checkFamilyPassword()`.
    // So, the function needs to be globally accessible.
    
    // Re-fetch elements here as they might not be available when script is first parsed
    const passInput = document.getElementById('family-password-input');
    const passSection = document.getElementById('password-section-family');
    const mainCont = document.getElementById('family-main-content');
    const passError = document.getElementById('family-password-error');
    const CORRECT_PASS = "Super"; // Keep consistent

    if (passInput.value === CORRECT_PASS) {
        passSection.style.display = 'none';
        mainCont.style.display = 'block';
        passError.textContent = '';
        
        // Call initializePageContent if it's not already called by DOMContentLoaded logic
        // This requires initializePageContent to be accessible or its logic duplicated.
        // For now, let's assume DOMContentLoaded handles initialization after successful password.
        // The DOMContentLoaded's checkFamilyPassword will call initializePageContent.
        // This global one is mainly to make the HTML onclick valid.
        // The actual logic is better inside the DOMContentLoaded's version.
        
        // To ensure it initializes, we can call the core logic here too,
        // but it's better to have one source of truth.
        // The DOMContentLoaded's event listener on the button is the primary one.
        // This global function is a fallback for the HTML onclick.
        // The button inside passwordSection already has its listener from DOMContentLoaded.
    } else {
        passError.textContent = 'Incorrect password. Please try again.';
        passInput.value = '';
    }
};