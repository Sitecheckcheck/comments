import { loginUser, registerUser, getComments } from "./api.js";

export function renderLoginComponent({
  appEl,
  setToken,
  setName,
  setLogin,
  fetchRenderComments,
  comments,
}) {
  let isLoginMode = true;
  let isStart = true;

  const renderForm = () => {
    let appHtml;

    if (isStart) {
      getComments().then((responseData) => {
        const options = {
          year: "2-digit",
          month: "numeric",
          day: "numeric",
          timezone: "UTC",
          hour: "numeric",
          minute: "2-digit",
        };

        const appComments = responseData.comments.map((comment) => {
          return {
            name: comment.author.name,
            date: new Date(comment.date).toLocaleString("ru-RU", options),
            text: comment.text,
            likes: comment.likes,
            isLike: false,
            login: comment.author.login,
            commentId: comment.id,
            userId: comment.author.id,
          };
        });

        comments = appComments;

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
                        <button data-index ='${index}' class="like-button like-button_start ${
              comment.isLike ? "-active-like" : ""
            }"></button>
                        </div>
                    </div>                  
                    </li>`;
          })
          .join("");

        appEl.innerHTML = `
          <div class="container"> 
          <ul id="list" class="comments">${commentHtml}</ul>
          <div class="text-start">
          Чтобы добавить комментарий, <span class="link-start" id="link">авторизуйтесь</span>
          </div>
          </div>
          `;

        document.getElementById("link").addEventListener("click", () => {
          isStart = !isStart;
          renderForm();
        });
      });
    } else {
      appHtml = `    
        <div class="container">
        <div class="add-form" id="input-box">
        ${
          isLoginMode
            ? ""
            : `<input
        id="name-input"
        type="text"
        class="add-form-name"
        placeholder="Введите имя"
        />`
        }
        
        <input
        id="login-input"
        type="text"
        class="add-form-name"
        placeholder="Введите логин"
        />
        <input
        id="password-input"
        type="password"
        class="add-form-name"
        placeholder="Введите пароль"
        />
      <div class="add-form-row add-form-row_start">
        <button id="login-button" class="add-form-button">${
          isLoginMode ? "Войти" : "Регистрация"
        }</button></ br>
        <span id="toggle-button" class="login-toggle">${
          isLoginMode ? "Перейти к регистрации" : "Перейти ко входу"
        }</span>
        </div>
        </div>
        </div>
        `;

      appEl.innerHTML = appHtml;

      document.getElementById("login-button").addEventListener("click", () => {
        if (isLoginMode) {
          const login = document.getElementById("login-input").value;
          const password = document.getElementById("password-input").value;

          if (!login) {
            alert("Введите логин");
            return;
          }

          if (!password) {
            alert("Введите пароль");
            return;
          }

          loginUser({
            login: login,
            password: password,
          })
            .then((user) => {
              setToken(`Bearer ${user.user.token}`);
              setName(user.user.name);
              setLogin(user.user.login);
              fetchRenderComments();
            })
            .catch((error) => {
              alert(error.message);
            });
        } else {
          const name = document.getElementById("name-input").value;
          const login = document.getElementById("login-input").value;
          const password = document.getElementById("password-input").value;

          if (!name) {
            alert("Введите имя");
            return;
          }

          if (!login) {
            alert("Введите логин");
            return;
          }

          if (!password) {
            alert("Введите пароль");
            return;
          }

          registerUser({
            name: name,
            login: login,
            password: password,
          })
            .then((user) => {
              setToken(`Bearer ${user.user.token}`);
              setName(user.user.name);
              setLogin(user.user.login);
              fetchRenderComments();
            })
            .catch((error) => {
              alert(error.message);
            });
        }
      });

      document.getElementById("toggle-button").addEventListener("click", () => {
        isLoginMode = !isLoginMode;
        renderForm();
      });
    }
  };

  renderForm();
}
