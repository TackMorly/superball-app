
// Supabase API連携
const SUPABASE_URL = 'https://zsefdiivatbmzynlovwj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZWZkaWl2YXRibXp5bmxvdndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNDkyNzUsImV4cCI6MjA3MjYyNTI3NX0.sva0fJJrHa43SMtoGLQ2rvWpbmAH2j3UYU8knSrDwNk';

async function getEntries() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ranking?select=*`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    return await res.json();
}

async function saveEntry(name, count) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ranking`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ name, count })
        });
        const data = await res.json();
        console.log('saveEntry response:', res.status, data);
        if (!res.ok) {
            alert('保存に失敗しました: ' + (data.message || JSON.stringify(data)));
        }
    } catch (err) {
        console.error('saveEntry error:', err);
        alert('保存時にエラーが発生しました: ' + err.message);
    }
}

function renderEntries() {
    const list = document.getElementById('entryList');
    list.innerHTML = '';
    getEntries().then(entries => {
        // 名前ごとに最高記録のみ抽出
        const bestEntries = {};
        entries.forEach((entry) => {
            if (!bestEntries[entry.name] || bestEntries[entry.name].count < entry.count) {
                bestEntries[entry.name] = entry;
            }
        });
        const uniqueEntries = Object.values(bestEntries);
        uniqueEntries.forEach((entry, idx) => {
            const li = document.createElement('li');
            li.className = 'entry-item';
            li.innerHTML = `
                <span>${entry.name}：${entry.count}個</span>
                <span class="entry-actions">
                    <button class="edit" data-idx="${idx}">編集</button>
                    <button class="delete" data-idx="${idx}">削除</button>
                </span>
            `;
            list.appendChild(li);
        });
    });
}

document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const count = parseInt(document.getElementById('count').value, 10);
    if (!name || isNaN(count)) return;
    // Supabaseに新規登録（同名最高記録は表示時に制御）
    saveEntry(name, count).then(() => {
        renderEntries();
        this.reset();
    });
});

document.getElementById('entryList').addEventListener('click', function(e) {
    // Supabaseから取得して編集・削除
    getEntries().then(entries => {
        const bestEntries = {};
        entries.forEach((entry) => {
            if (!bestEntries[entry.name] || bestEntries[entry.name].count < entry.count) {
                bestEntries[entry.name] = entry;
            }
        });
        const uniqueEntries = Object.values(bestEntries);
        if (e.target.classList.contains('delete')) {
            const idx = e.target.getAttribute('data-idx');
            const target = uniqueEntries[idx];
            // 同名の全エントリーを削除
            Promise.all(
                entries.filter(entry => entry.name === target.name)
                    .map(entry => fetch(`${SUPABASE_URL}/rest/v1/ranking?id=eq.${entry.id}`, {
                        method: 'DELETE',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        }
                    }))
            ).then(() => renderEntries());
        } else if (e.target.classList.contains('edit')) {
            const idx = e.target.getAttribute('data-idx');
            const target = uniqueEntries[idx];
            const newName = prompt('名前を編集', target.name);
            if (newName === null) return;
            const newCount = prompt('すくった数を編集', target.count);
            if (newCount === null || isNaN(parseInt(newCount, 10))) return;
            // 同名の全エントリーを削除し、新しいエントリーを追加
            Promise.all(
                entries.filter(entry => entry.name === target.name)
                    .map(entry => fetch(`${SUPABASE_URL}/rest/v1/ranking?id=eq.${entry.id}`, {
                        method: 'DELETE',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        }
                    }))
            ).then(() => {
                saveEntry(newName.trim(), parseInt(newCount, 10)).then(() => renderEntries());
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', renderEntries);
