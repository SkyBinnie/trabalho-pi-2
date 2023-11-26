const firebaseConfig = {
  apiKey: "AIzaSyAZ8y-dgjor8RkljnWaOlfuvAOXkpCRp9Q",
  authDomain: "albumsite-gti.firebaseapp.com",
  projectId: "albumsite-gti",
  storageBucket: "albumsite-gti.appspot.com",
  messagingSenderId: "548008487631",
  appId: "1:548008487631:web:e891d94fa6678161b025ba",
  measurementId: "G-S4JW4FGQML",
};

//Inicializando o Firebase
firebase.initializeApp(firebaseConfig);
//Definindo a URL padrão do site
const urlApp = "http://127.0.0.1:5500/index.html";

function logaGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(`Erro ao efetuar o login: ${error.message}`);
    });
}

function verificaLogado() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
    
      localStorage.setItem("usuarioId", user.uid);

      //Imagem do usuário
      let imagem = document.getElementById("imagemUsuario");

      user.photoURL
        ? (imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle" width="48" />`)
        : (imagem.innerHTML +=
            '<img src="images/logo-google.svg" title="Usuário sem foto" class="img rounded-circle" width="32" />');
    } else {
      localStorage.removeItem("usuarioId");
      window.location.href = "login.html"; 
    }
  });
}

function logoutFirebase() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      localStorage.removeItem("usuarioId");
      window.location.href = "index.html";
    })
    .catch(function (error) {
      alert(`Não foi possível efetuar o logout: ${error.message}`);
    });
}

async function salvaCadastrados(cadastrados) {
  //obtendo  o usuário atual
  let usuarioAtual = firebase.auth().currentUser;
  try {
    await firebase
      .database()
      .ref("cadastro")
      .push({
        ...cadastrados,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName,
        },
      });
    alert(" ✅Registro incluído com sucesso");
    //Limpar o formulario
    document.getElementById("formCadastro").reset();
  } catch (error) {
    alert(`🤡Erro ao salvar: ${error.message}`);
  }
}

//evento submit do formulario (realtime database)
document
  .getElementById("formCadastro")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const cadastrados = {
      nome: document.getElementById("nome").value,
      cep: document.getElementById("cep").value,
      endereco: document.getElementById("endereco").value,
      complemento: document.getElementById("complemento").value,
      num: document.getElementById("num").value,
      presente: document.getElementById("presente").value,
      telefone: document.getElementById("telefone").value,
    };
    salvaCadastrados(cadastrados);
  });

//tabela do "resumo das informações"
async function carregaCadastrados() {
  const tabela = document.getElementById("dadosTabela");
  const usuarioAtual = localStorage.getItem("usuarioId");

  await firebase
    .database()
    .ref("cadastro")
    .orderByChild("nome")
    .on("value", (snapshot) => {
      tabela.innerHTML = ``;
      if (!snapshot.exists()) {
        tabela.innerHTML = `<tr class= 'table-danger'><td colspan='4'> Ainda não existe
      nenhum registro </td></tr>`;
      } else {
        snapshot.forEach((item) => {
          const dados = item.val();
          console.log("Dados do Firebase:", dados);
          const id = item.key;
          const isUsuarioAtual = dados.usuarioInclusao.uid === usuarioAtual;
          const botao = isUsuarioAtual
            ? `<button class= 'btn btn-sm btn-danger' onclick='removeCadastrados("${id}")'
          title='Excluir o registo atual'> 🚮Excluir </button>`
            : `⛔Indisponível`;

          tabela.innerHTML += `
        <tr>
          <td>${dados.nome}</td>
          <td>${dados.endereco}-${dados.cep}</td>
          <td>${dados.complemento}</td>
          <td>${dados.num}</td>
          <td>${dados.presente}</td>
          <td>${dados.telefone}</td>
          <td>${botao}</td
        </tr
        `;
        });
      }
    });
}

async function removeCadastrados(id) {
  if (confirm("Deseja remover seu cadastro?")) {
    const cadastroRef = await firebase.database().ref("cadastro/" + id);

    //Remoção do Cadastro
    cadastroRef
      .remove()
      .then(function () {
        alert("Informações excluídas com sucesso!");
      })
      .catch(function (error) {
        alert(`Erro ao excluir suas informações: ${error.message}. Tente novamente`);
      });
  }
}
