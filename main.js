// vars
const apiUrl =
  'https://raw.githubusercontent.com/altkraft/for-applicants/master/frontend/titanic/passengers.json';
const itemsContainer = document.querySelector('.items-container');
const footer = document.querySelector('.footer');
const footerLoader = document.querySelector('.loaderFooter');
const loaderMain = document.querySelector('.loaderMain');
const searchInput = document.querySelector('.search-input');
const form = document.querySelector('.form');
const clearBtn = document.querySelector('.clear-btn');
const errorSection = document.querySelector('.error');
const footerError = document.querySelector('.footer-error');

// states
let globalState = [];
let filteredState = [];
let renderState = [];

// counters
const countValue = 16;
const countFromValue = 0;
let fromIndex = countFromValue;
let toIndex = countValue;
let renderedItems = 0;

// fetch data
const fetchData = async () => {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    globalState = data;
    filteredState = globalState;
    setTimeout(() => {
      hideLoader(loaderMain);
      renderUI();
    }, 500);
  } catch (error) {
    renderError('Something went wrong');
  }
};

// render
const renderUI = () => {
  footerError.innerHTML = '';
  const currentRender = filteredState.slice(fromIndex, toIndex);
  renderState = currentRender;

  renderState.forEach(el => {
    const { name, gender, age, survived } = el;
    const renderName = name ? name : 'unknown';
    const renderGender = gender ? gender : 'unknown';
    const flooredAge = Math.floor(age);
    const renderSurvived = survived ? 'survived' : 'not survived';

    const html = `
      <tr>
        <td>${renderName}</td>
        <td>${renderGender}</td>
        <td>${flooredAge}</td>
        <td>${renderSurvived}</td>
      </tr>
  `;

    itemsContainer.insertAdjacentHTML('beforeend', html);
  });

  renderedItems = itemsContainer.children.length;
};

const renderError = error => {
  const html = `
    <h1>${error}</h1>
  `;
  errorSection.innerHTML = html;
};

const removeError = () => {
  errorSection.innerHTML = '';
};

const clearContainer = () => {
  itemsContainer.innerHTML = '';
};

const showLoader = loader => {
  loader.style.display = 'flex';
};

const hideLoader = loader => {
  loader.style.display = 'none';
};

// lazy load
const lazyLoad = () => {
  setTimeout(() => {
    toIndex += countValue;
    fromIndex += countValue;
    renderUI();
  }, 500);
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (renderedItems < filteredState.length) {
        lazyLoad();
        showLoader(footerLoader);
        return;
      }

      footerError.innerHTML = 'No more data';
    } else {
      hideLoader(footerLoader);
    }
  });
});

observer.observe(footer);

// update state
const updateState = newState => {
  filteredState = newState;
  toIndex = countValue;
  fromIndex = countFromValue;
  resetRenderedItems();
  renderUI();
};

const resetRenderedItems = () => {
  renderedItems = 0;
}

// search
const search = e => {
  e.preventDefault();
  removeError();
  const value = e.target.value.toLowerCase().trim();
  const newState = [];

  globalState.forEach(passenger => {
    const { name, gender, age, survived } = passenger;
    const hasName = name.toLowerCase().includes(value);
    const ageFilter = Math.floor(age).toString();
    const survivedFilter = survived ? 'survived' : 'not survived';
    const isGender = gender.includes(value);
    const isNotSurvived = survivedFilter.includes(value);
 
    if (hasName) {
      newState.push(passenger);
    }

    if (isGender) {
      if (value === 'male') {
        const filtered = globalState.filter(el => el.gender === value);
        newState.push(...filtered);
      }

      newState.push(passenger);
    }

    if (value === ageFilter) {
      const filtered = globalState.filter(el => el.age === age);
      newState.push(...filtered);
    }

    if (isNotSurvived) {
      if (value === 'survived') {
        const filtered = globalState.filter(el => el.survived === true);
        newState.push(...filtered);
      }

      newState.push(passenger);
    }
  });

  if (newState.length === 0) {
    renderError('Nothing found');
  }

  clearContainer();
  updateState(newState);
};

const clearInput = () => {
  searchInput.value = '';
  clearContainer();
  removeError();
  updateState(globalState);
};

// debounce 
const debounce = (callback, delay = 1000) => {
  let timeout = null;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(...args);
    }, delay)
  }
}

const debouncedSearch = debounce(search, 500)

// events
searchInput.addEventListener('input', debouncedSearch);
form.addEventListener('submit', e => {
  e.preventDefault();
  return;
});

clearBtn.addEventListener('click', clearInput);

// init
fetchData();
