export function getComments() {
  return fetch(
    "https://webdev-hw-api.vercel.app/api/v2/pavel-danilov/comments",
    {
      method: "GET",
    }
  ).then((response) => {
    return response.json();
  });
}

export function deleteComments({ token, id }) {
  return fetch(
    "https://webdev-hw-api.vercel.app/api/v2/pavel-danilov/comments/" + id,
    {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    }
  );
}

export function addComments({ token, text }) {
  return fetch(
    "https://webdev-hw-api.vercel.app/api/v2/pavel-danilov/comments",
    {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { Authorization: token },
    }
  );
}

export function loginUser({ login, password }) {
  return fetch("https://webdev-hw-api.vercel.app/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400){
        throw new Error('Неверный логин или пароль')
    }
    return response.json();
  });
}

export function registerUser({ name, login, password }) {
    return fetch("https://webdev-hw-api.vercel.app/api/user", {
      method: "POST",
      body: JSON.stringify({
        name,
        login,
        password,
      }),
    }).then((response) => {
      if (response.status === 400){
          throw new Error('Такой пользователь уже существует')
      }
      return response.json();
    });
  }