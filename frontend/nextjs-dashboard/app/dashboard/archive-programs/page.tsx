// Ссылка страницы http://localhost:3000/dashboard/archive-programs

// app/dashboard/archive-programs/page.tsx

import React from 'react';
import MenuList from './menu-list/MenuList';
import Player from './player/Player';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <p>ДОСТУПНА : ВСЕМ</p>
			<p>.</p>
      <h1 className="text-3xl font-semibold mb-4">Архив программ сеансов</h1>
      <MenuList />
      <Player />
    </div>
  );
}
