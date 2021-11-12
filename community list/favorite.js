const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const userList = JSON.parse(localStorage.getItem('favoriteUsers'))


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
            <button class="btn btn-secondary btn-remove-favorite ml-2" data-id="${item.id}">X</button>
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


//將朋友從摯友清單中刪除
function removeFromFavorite(id) {
  // if (!movies || !movies.length) return //防止 movie 是空陣列的狀況

  //透過 id 找到要刪除朋友的 index
  const userIndex = userList.findIndex((user) => user.id === id)
  if(userIndex === -1) return

  //刪除該筆朋友
  userList.splice(userIndex,1)

  //存回 local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(userList))

  //更新頁面
  renderUserList(userList)
}


// 監聽 data panel
dataPanel.addEventListener('click',function onPanelClicked(event){
  if (event.target.matches('.btn-show-user')) {
    showUserModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
      removeFromFavorite(Number(event.target.dataset.id))
    }
})

renderUserList(userList)