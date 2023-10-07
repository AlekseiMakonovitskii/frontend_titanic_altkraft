// vars
const apiUrl =
  'https://raw.githubusercontent.com/altkraft/for-applicants/master/frontend/titanic/passengers.json';
const itemsContainer = document.querySelector('.items-container');
const footer = document.querySelector('.footer');
const loader = document.querySelector('.loader');
const searchInput = document.querySelector('.search-input');
const form = document.querySelector('.form');
const clearBtn = document.querySelector('.clear-btn');
const errorSection = document.querySelector('.error');
const footerError = document.querySelector('.footer-error');

// states
let globalState = [];
let filteredState = [];
let renderState = [];

// index counter
const countValue = 16;
let toIndex = countValue;

// fetch data
const fetchData = async () => {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    globalState = data;
    filteredState = globalState;
    renderUI();
  } catch (error) {}
};

// render
const renderUI = () => {
  itemsContainer.innerHTML = '';
  footerError.innerHTML = '';
  const currentRender = filteredState.slice(0, toIndex);
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
};

const renderError = (error) => {
  const html = `
    <h1>${error}</h1>
  `
  errorSection.innerHTML = html;
}

const removeError = () => {
  errorSection.innerHTML = '';
}

// lazy load
const lazyLoad = () => {
  setTimeout(() => {
    toIndex += countValue;
    renderUI();
  }, 500);
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (renderState.length < filteredState.length) {
        lazyLoad();
        loader.style.display = 'flex';
        return;
      }

      footerError.innerHTML = 'No more data'
    } else {
      loader.style.display = 'none';
    }
  });
});

observer.observe(footer);

// update state
const updateState = newState => {
  filteredState = newState;
  toIndex = countValue;
  renderUI();
};

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
  
    if (hasName) {
      newState.push(passenger);
    }

    if (value === gender) {
      const filtered = globalState.filter(el => el.gender === value);
      newState.push(...filtered);
    }

    if (value === ageFilter) {
      const filtered = globalState.filter(el => el.age === age);
      newState.push(...filtered);
    }

    if (value === survivedFilter) {
      const filtered = globalState.filter(el => el.survived === survived);
      newState.push(...filtered);
    }
  });

  if (newState.length === 0) {
    renderError('Found nothing')
  }

  updateState(newState);
};

const clearInput = () => {
  searchInput.value = '';
  removeError();
  updateState(globalState);
}

// events
searchInput.addEventListener('input', search);
form.addEventListener('submit', e => {
  e.preventDefault();
  return;
});
clearBtn.addEventListener('click', clearInput);

// init
fetchData();
