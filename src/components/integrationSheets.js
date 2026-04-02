import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getTransactions } from '../api/storage.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

export function initGoogleSync() {
  const btnSync = document.getElementById('btn-sync');
  const syncLabel = document.getElementById('sync-label');
  const syncDot = document.getElementById('sync-dot');

  if (!btnSync) return;
  btnSync.addEventListener('click', async () => {
    try {
      syncLabel.textContent = 'Autenticando...';
      syncDot.className = 'sync-dot warning';
      btnSync.disabled = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      const user = result.user;
      syncLabel.textContent = `Criando planilha para ${user.displayName.split(' ')[0]}...`;
      const sheetUrl = await exportToGoogleSheets(accessToken);
      syncLabel.innerHTML = `Sincronizado! <a href="${sheetUrl}" target="_blank" style="color: var(--color-primary-500); text-decoration: underline;">Abrir Planilha</a>`;
      syncDot.className = 'sync-dot connected';
      btnSync.textContent = 'Backup Concluído';
      btnSync.disabled = true;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      syncLabel.textContent = 'Erro de Autenticação';
      syncDot.className = 'sync-dot error';
      btnSync.disabled = false;
    }
  });
}

async function exportToGoogleSheets(accessToken) {
  const transactions = getTransactions();
  if (transactions.length === 0) {
    throw new Error('Não há transações para exportar.');
  }
  const header = ['ID', 'description', 'value', 'type', 'category', 'date'];
  const values = [
    header,
    ...transactions.map((transaction) => [
      transaction.id,
      transaction.description,
      transaction.value.toString().replace('.', ','),
      transaction.type,
      transaction.category,
      transaction.date,
    ]),
  ];
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const createResponse = await fetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `Backup Sem Aperto - ${dataAtual}`,
        },
      }),
    },
  );
  if (!createResponse.ok) {
    const errorDetails = await createResponse.json();
    console.error(
      'O Google recusou a criação da planilha. Detalhes:',
      errorDetails,
    );
    throw new Error('Falha ao criar a planilha. Verifique o console.');
  }
  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetName = sheetData.sheets[0].properties.title;
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values,
      }),
    },
  );

  if (!updateResponse.ok) throw new Error('Falha ao inserir os dados');

  return sheetData.spreadsheetUrl;
}
