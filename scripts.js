// Course class representing a single course entry with fields: id, title, department, level, credits, instructor, semester, description
class Course {

    // Course constructor
    constructor(id, title, department, level, credits, instructor, semester, description) {
        this.id = checkValue(id);
        this.title = checkValue(title);
        this.department = checkValue(department);
        this.level = checkValue(level);
        this.credits = checkValue(credits);
        this.instructor = checkValue(instructor);
        this.semester = checkValue(semester);
        this.description = checkValue(description);
    }

    // Summary method: Returns just the course ID
    summary() {
        return `${this.id}`;
    }

    // details method: returns a formatted string containing all the course details
    details() {
        return `
        ${this.id}
        Title: ${this.title}
        Department: ${this.department}
        Level: ${this.level}
        Credits: ${this.credits}
        Instructor: ${this.instructor}
        Semester: ${this.semester}
        Description: ${this.description}
        `;
    }

}

// Get references to key DOM elements
const fileInput = document.getElementById('fileInput');
const error = document.getElementById('error');
const courseList = document.getElementById('courseList');
const courseDetails = document.getElementById('details');

const filterDepartment = document.getElementById('filterDepartment');
const filterLevel = document.getElementById('filterLevel');
const filterCredits = document.getElementById('filterCredits');
const filterInstructor = document.getElementById('filterInstructor');
const sortBy = document.getElementById('sortBy');

// Declare two arrays to store all loaded courses and currenty filtered list
let courses = [];
let filtered = [];

// Handle file upload and parse JSON
fileInput.addEventListener('change', () => {
    error.textContent = '';
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            // Parse JSON: supports array or { courses: [...] } format
            const data = JSON.parse(reader.result);
            const array = Array.isArray(data) ? data : data.courses;

            // Create Course instances using the JSON objects
            courses = array.map(course => new Course(
                course.id,
                course.title,
                course.department, 
                course.level,
                course.credits,
                course.instructor,
                course.semester,
                course.description
            ));

            // Call functions to build filters and render initial list
            buildFilterOptions();
            applyFiltersAndSort();

        // Catch block for JSON parsing errors
        } catch (e) {

            // Display error and clear UI on invalid JSON input
            error.textContent = 'Error parsing JSON file.';
            
            // Clear data and UI
            courses = [];
            filtered = [];
            showList();
            courseDetails.textContent = '';  

            // Display error in console for debugging purposes
            console.error(e);
    }
    };
    reader.readAsText(file);
});

// Helper function to check for null, undefined, or empty string values and return 'N/A' if so
function checkValue(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    if (typeof value === 'string' && value.trim() === "") {
        return 'N/A';
    }
    return value;
}

// Function to sort the filtered courses based on the selected sort option
function sortCourses() {
    const key = sortBy.value;

    // Function to converts semester string ("Season Year") into a numeric sortable value
    function getSemesterOrder(sem) {
        const [season, year] = sem.split(' ');
        const yearNum = parseInt(year, 10);
        const order = {Winter: 0, Spring: 1, Summer: 2, Fall: 3} [season];
        return yearNum * 10 + order;
    }

    // Sorting logic based on selected key
    if (key === 'titleAZ') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (key === 'titleZA') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else if (key === 'idAsc') filtered.sort((a, b) => a.id.localeCompare(b.id));
    else if (key === 'idDesc') filtered.sort((a, b) => b.id.localeCompare(a.id));
    else if (key === 'semAsc') filtered.sort((a, b) => getSemesterOrder(a.semester) - getSemesterOrder(b.semester));
    else if (key === 'semDesc') filtered.sort((a, b) => getSemesterOrder(b.semester) - getSemesterOrder(a.semester));
}


// Function to build filter options based on unique values in the loaded courses in the following categories: department, level, credits, instructor
function buildFilterOptions() {
    fillSelect(filterDepartment, uniqueValues('department'));
    fillSelect(filterLevel, uniqueValues('level'));
    fillSelect(filterCredits, uniqueValues('credits'));
    fillSelect(filterInstructor, uniqueValues('instructor'));
}

// Helper function to get the unique values for a given course parameter (e.g. all the different professors)
function uniqueValues(paramater) {
    return [...new Set(courses.map(course => course[paramater]))].sort();
}

// Helper function to fill a <select> element with given values, and an "All" option at the top
function fillSelect(selectElement, values) {
    selectElement.innerHTML = '<option value="All">All</option>' + values.map(value => `<option value="${value}">${value}</option>`).join('');
}

// Recalculate filtered list + sorted data and render whenever a filter or sort option changes
[filterDepartment, filterLevel, filterCredits, filterInstructor, sortBy].forEach(element => {
    element.addEventListener('change', applyFiltersAndSort);
});

// Function to apply current filters and sorting to the courses array
function applyFiltersAndSort() {
    filtered = courses
    .filter(course => filterDepartment.value === 'All' || course.department === filterDepartment.value)
    .filter(course => filterLevel.value === 'All' || course.level.toString() === filterLevel.value)
    .filter(course => filterCredits.value === 'All' || course.credits.toString() === filterCredits.value)
    .filter(course => filterInstructor.value === 'All' || course.instructor === filterInstructor.value);

    // Clear course details pane when filters or new sorting are applied
    courseDetails.textContent = "";

    // Sort the filtered results and then display them
    sortCourses();
    showList();
}

// Function to show the filtered and sorted course list in the UI
function showList() {
    // If no matching courses, show "No Results"
    if (filtered.length === 0) {
        courseList.innerHTML = '<li class="no-results">No Results</li>';
        return;   // Skip adding event listeners
    }
    
    // Otherwise, show the list of filtered courses
    courseList.innerHTML = filtered.map(course => `<li data-id="${course.id}">${course.summary()}</li>`).join('');

    // Add click events to each list item to show course details
    [...courseList.querySelectorAll('li')].forEach(li => {
        li.addEventListener('click', () => {
            const id = li.getAttribute('data-id');
            const course = filtered.find(c => c.id === id);
            if (course) showDetails(course);   
        });
    });
}

// Function to display the details of a selected course in the UI
function showDetails(course) {
    courseDetails.textContent = course.details();
}