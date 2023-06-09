import { getComments, deleteComments, addComments, addLike } from "./api.js";
import { renderLoginComponent } from "./component.js";
import { formatDateToRu, formatDateToUs } from "./lib/formatDate/formatDate.js"
import { format } from "date-fns";

// let token = "Bearer cgascsbkas6g5g5g5g5g6gcgascsbkas";
let token = localStorage.getItem("token");
let name = localStorage.getItem("name");
let loginDel = localStorage.getItem("loginDel");
// localStorage.clear();
// let name;
// let token;
// let loginDel;
let comments = [];

// renderComments();
fetchRenderComments();
likeButton();

function fetchRenderComments() {
  return getComments()
    .then((responseData) => {
      // const options = {
      //   year: "2-digit",
      //   month: "numeric",
      //   day: "numeric",
      //   timezone: "UTC",
      //   hour: "numeric",
      //   minute: "2-digit",
      // };

      const appComments = responseData.comments.map((comment) => {
        return {
          name: comment.author.name,
          date: format(new Date(comment.date), 'yyyy-MM-dd hh.mm.ss'),
          text: comment.text,
          likes: comment.likes,
          isLiked: comment.isLiked,
          login: comment.author.login,
          commentId: comment.id,
          userId: comment.author.id,
        };
      });

      comments = appComments;
      renderComments();
    })
    .catch((error) => {
      alert("Кажется, у вас сломался интернет, попробуйте позже");
    });
}

function renderComments() {
  const appEl = document.getElementById("app");

  if (!token) {
    renderLoginComponent({
      appEl,
      setToken: (newToken) => {
        token = newToken;
        localStorage.setItem("token", token);
      },
      setName: (newName) => {
        name = newName;
        localStorage.setItem("name", name);
      },
      setLogin: (newLogin) => {
        loginDel = newLogin;
        localStorage.setItem("loginDel", loginDel);
      },
      fetchRenderComments,
      renderComments,
    });

    return;
  }

  const commentHtml = comments
    .map((comment, index) => {
      return `<li class="comment" data-index = '${index}'>
      <div class="comment-header">
        <div>${comment.name}</div>
        <div>${comment.date}</div>
      </div>
      <div class="comment-body">
        <div class="comment-text">
          ${comment.text}
        </div>
      </div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">${comment.likes}</span>
          <button data-index ='${index}' data-id = ${
        comment.commentId
      } class="like-button ${comment.isLiked ? "-active-like" : ""}"></button>
        </div>
      </div>
      <div >
        <button data-id = ${comment.commentId} data-user = ${comment.login} 
        class="delete-button">удалить</button>
      </div>
    </li>`;
    })
    .join("");

  const appHtml = `    
            <div class="container"> 
            <ul id="list" class="comments">${commentHtml}</ul>
            <div class="add-form" id="input-box">
              <input class="add-form-name name-input" id="name-input" value="${name}" disabled>
              <textarea
                id="text-input"
                type="textarea"
                class="add-form-text"
                placeholder="Введите ваш коментарий"
                rows="4"
              ></textarea>
              <div class="add-form-row">
                <button id="add-button" class="add-form-button">Написать</button>
              </div>
            </div>
          </div>`;

  appEl.innerHTML = appHtml;

  const buttonElement = document.getElementById("add-button");
  const textInputElement = document.getElementById("text-input");
  const deleteButtons = document.querySelectorAll(".delete-button");

  buttonElement.addEventListener("click", () => {
    addComments({ text: textInputElement.value, token })
      .then((response) => {
        if (response.status === 201) {
          return;
        } else if (response.status === 400) {
          throw new Error("Комментарий должен быть не короче 3 символов");
        } else if (response.status === 500) {
          throw new Error("Сервер упал");
        } else {
          throw new Error("Что то пошло не так");
        }
      })
      .then(() => {
        return fetchRenderComments();
      })
      .then(() => {
        textInputElement.value = "";
      })
      .catch((error) => {
        console.log(error);
        if (
          error.message === "Комментарий должен быть не короче 3 символов" ||
          error.message === "Что то пошло не так"
        ) {
          alert(error.message);
        } else if (error.message === "Сервер упал") {
          buttonElement.click();
        } else {
          alert("Кажется, у вас сломался интернет, попробуйте позже");
        }
      });
  });

  for (const deleteButton of deleteButtons) {
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const id = deleteButton.dataset.id;
      const loginUser = deleteButton.dataset.user;

      if (loginDel === loginUser) {
        deleteComments({ token, id }).then(() => {
          fetchRenderComments();
        });
      }
    });
  }

  likeButton();
  inputClick();
}

function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
}

function inputClick() {
  const inputInElement = document.querySelectorAll(".add-form-text");
  for (const i of inputInElement) {
    i.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
}

function likeButton() {
  const likeElements = document.querySelectorAll(".like-button");
  for (const i of likeElements) {
    i.addEventListener("click", (event) => {
      event.stopPropagation();

      const id = i.dataset.id;
      addLike(token, id)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
         
          comments[i.dataset.index].likes = data.result.likes;
          comments[i.dataset.index].isLiked = data.result.likes;

          renderComments();
        });
    });
  }
}

// document.addEventListener("keyup", function (e) {
//   if (e.keyCode === 13) {
//     document.getElementById("add-button").click();
//   }
// });
