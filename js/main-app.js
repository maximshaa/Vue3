new Vue({
    el: '#app',
    template: `
    <div>
      <h1>канбан столбы</h1>
      <div class="board">
        <div class="column">
          <h2>Запланированные задачи</h2>
          <div class="addForm">
            <input v-model="newCard.title" placeholder="Заголовок">
            <textarea v-model="newCard.description" placeholder="Описание"></textarea>
            <input type="date" v-model="newCard.deadline">
            <button @click="addCard">Добавить</button>
          </div>
          <div v-for="(card, index) in planned" :key="card.id" class="card">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p>Создано: <span>{{ card.createdAt }}</span></p>
            <p>Дэдлайн: <span>{{ card.deadline }}</span></p>
            <p v-if="card.updatedAt">Изменено: <span>{{ card.updatedAt }}</span></p>
            <button @click="editCard('planned', index)">Редактировать описание</button>
            <button @click="deleteCard('planned', index)">Удалить</button>
            <button @click="moveCard('planned', index)">В работу</button>
          </div>
        </div>
        <div class="column">
          <h2>Задачи в работе</h2>
          <div v-for="(card, index) in inprogress" :key="card.id" class="card">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p>Создано: <span>{{ card.createdAt }}</span></p>
            <p>Дэдлайн: <span>{{ card.deadline }}</span></p>
            <p v-if="card.updatedAt">Изменено: <span>{{ card.updatedAt }}</span></p>
            <button @click="editCard('inprogress', index)">Редактировать описание</button>
            <button @click="moveCard('inprogress', index)">В тестирование</button>
          </div>
        </div>
        <div class="column">
          <h2>Тестирование</h2>
          <div v-for="(card, index) in testing" :key="card.id" class="card">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p>Создано: <span>{{ card.createdAt }}</span></p>
            <p>Дэдлайн: <span>{{ card.deadline }}</span></p>
            <p v-if="card.updatedAt">Изменено: <span>{{ card.updatedAt }}</span></p>
            <button @click="editCard('testing', index)">Редактировать описание</button>
            <button @click="moveCard('testing', index)">Выполнить</button>
            <button @click="returnCard(index)">Вернуть в работу</button>
          </div>
        </div>
        <div class="column">
          <h2>Выполненные задачи</h2>
          <div v-for="card in done" :key="card.id" class="card">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p>Создано: <span>{{ card.createdAt }}</span></p>
            <p>Дэдлайн: <span>{{ card.deadline }}</span></p>
            <p v-if="card.updatedAt">Изменено: <span>{{ card.updatedAt }}</span></p>
            <p v-if="card.status==='ontime'">Выполнена в срок</p>
            <p v-if="card.status==='expired'">Просрочена</p>
          </div>
        </div>
      </div>
    </div>
  `,
    data: {
        planned: [],
        inprogress: [],
        testing: [],
        done: [],
        idCounter: 1,
        newCard: {
            title: '',
            description: '',
            deadline: ''
        }
    },
    methods: {
        addCard() {
            if (!this.newCard.title || !this.newCard.description || !this.newCard.deadline) {
                alert('Заполните все поля!');
                return;
            }

            const deadlineDate = new Date(this.newCard.deadline);
            const formattedDeadline = deadlineDate.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            this.planned.push({
                id: this.idCounter++,
                title: this.newCard.title,
                description: this.newCard.description,
                deadline: formattedDeadline,
                createdAt: new Date().toLocaleString('ru-RU',{
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                updatedAt: null,
                status: null
            });

            this.newCard = { title: '', description: '', deadline: '' };
        },
        deleteCard(column, index) {
            this[column].splice(index, 1);
        },
        editCard(column, index) {
            const card = this[column][index];
            const newDesc = prompt('Новое описание:', card.description);
            if (newDesc !== null && newDesc.trim() !== '') {
                card.description = newDesc;
                card.updatedAt = new Date().toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

            }
        },
        moveCard(column, index) {
            if (column === 'planned') {
                this.inprogress.push(this.planned.splice(index, 1)[0]);
            } else if (column === 'inprogress') {
                this.testing.push(this.inprogress.splice(index, 1)[0]);
            } else if (column === 'testing') {
                const card = this.testing.splice(index, 1)[0];

                const [day, month, year] = card.deadline.split('.');
                const deadlineDate = new Date(+year, +month - 1, +day);

                const now = new Date();
                if (now > deadlineDate) {
                    card.status = 'expired';
                } else {
                    card.status = 'ontime';
                }
                this.done.push(card);
            }
        },
        returnCard(index) {
            const card = this.testing.splice(index, 1)[0];
            const reason = prompt('Причина возврата?');

            if (!reason || reason.trim() === '') {
                alert('Причина обязательна!');
                this.testing.splice(index, 0, card);
                return;
            }

            card.updatedAt = new Date().toLocaleString();
            card.description += ' Возврат: ' + reason;
            this.inprogress.push(card);
        }
    }
});