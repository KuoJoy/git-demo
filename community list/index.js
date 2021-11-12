const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const userList = []
const USERS_PER_PAGE = 24
let filteredUsers = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 


function renderUserList(users) {
  let rawHTML = ''
  users.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            item.avatar
          }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.name + item.surname}</h5>
          </div>
          <div class="card-footer d-flex justify-content-end">
            <button class="btn btn-outline-primary btn-sm btn-show-user" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
            <button class="btn btn-add-favorite ml-2" data-id="${item.id}">♥</button>
          </div>
        </div>
      </div>
    </div>`
    })
    dataPanel.innerHTML = rawHTML
}     
  
function showUserModal (id) {
  const modalTitleBox = document.querySelector('.modal-title')
  const modalAvatarBox = document.querySelector('.modal-avatar')
  const modalUserInfoBox = document.querySelector('.modal-user-info')

  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalTitleBox.textContent = ''
  modalAvatarBox.src = ''
  modalUserInfoBox.textContent = ''

  axios.get(INDEX_URL + id)
    .then(response => {
    console.log(response.data)
      const user = response.data
      modalTitleBox.textContent = user.name + ' ' + user.surname
      modalAvatarBox.src = user.avatar
      modalUserInfoBox.innerHTML = `
      <p>email: ${user.email}</p>
      <p>gender: ${user.gender}</p>
      <p>age: ${user.age}</p>
      <p>region: ${user.region}</p>
      <p>birthday: ${user.birthday}</p>`
    })
    .catch(error => console.log(error))
}

//將摯友存入localStorage
function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const member = userList.find((user) => user.id === id)
  if (favoriteList.some((user) => user.id === id)) {
    return alert('此朋友已經在摯友清單中！')
  }
  favoriteList.push(member)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
}


//切割出每一頁要放的朋友數量及內容
function getUsersByPage(page) {
  //filteredUsers有東西，就取filteredUsers，否則取userList的資料
  const data = filteredUsers.length ? filteredUsers : userList
  //計算起始 index 
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//渲染出分頁數量
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}


// 監聽 data panel
dataPanel.addEventListener('click',function onPanelClicked(event){
  if (event.target.matches('.btn-show-user')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽 分頁點擊事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderUserList(getUsersByPage(page))
})

// 監聽 search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event)  {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // 用條件來迭代：filter
  filteredUsers = userList.filter((user) =>
  (user.name.toLowerCase() + user.surname.toLowerCase()).includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (!filteredUsers.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的人`)
  }
  //預設顯示第 1 頁的搜尋結果
  renderUserList(getUsersByPage(1))
  //重製分頁器
  renderPaginator(filteredUsers.length) 
})



axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    userList.push(...response.data.results)
    // console.log(userList)
    renderPaginator(userList.length)
    renderUserList(getUsersByPage(1))
  })
  .catch((err) => console.log(err))