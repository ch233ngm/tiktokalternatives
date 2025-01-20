class LikeSystem {
    constructor() {
        this.apiBaseUrl = 'https://api.tiktokalternatives.org';
        this.likeStates = new Map();
        this.initialized = false;
    }

    // 初始化点赞数据
    async initializeLikes() {
        if (this.initialized) return true;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/likes`);
            const data = await response.json();
            
            this.likeStates = new Map(
                data.map(item => [item.name, item.likes])
            );
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing likes:', error);
            return false;
        }
    }

    // 获取点赞数
    getLikes(appName) {
        return this.likeStates.get(appName) || 0;
    }

    // 更新显示的点赞数
    updateLikeDisplay(appName) {
        const likeButton = document.querySelector(`[data-app-name="${appName}"]`);
        if (!likeButton) return;

        const likeCount = likeButton.querySelector('.like-count');
        if (!likeCount) return;

        const count = this.getLikes(appName);
        likeCount.textContent = this.formatLikeCount(count);
        
        if (count > 0) {
            likeButton.classList.add('liked');
        }
    }

    // 添加排序方法
    sortByLikes(apps) {
        return [...apps].sort((a, b) => {
            const likesA = this.getLikes(a.name);
            const likesB = this.getLikes(b.name);
            return likesB - likesA; // 降序排序
        });
    }

    // 更新渲染方法
    renderApps(apps, container) {
        const sortedApps = this.sortByLikes(apps);
        container.empty();
        
        sortedApps.forEach(app => {
            const card = `
                <div class="app-card rounded-lg p-6 shadow-sm folded-corner neon-glow card-loading">
                    <div class="decorative-line decorative-line-top"></div>
                    <div class="diagonal-line"></div>
                    <div class="flex items-center mb-4">
                        <img src="${app.ico}" 
                             alt="${app.name}" 
                             class="w-12 h-12 rounded-lg mr-4"
                             onload="this.style.opacity='1'"
                             style="opacity: 0; transition: opacity 0.3s ease">
                        <div>
                            <h3 class="text-xl font-semibold">${app.name}</h3>
                            <span class="tag">${app.tag}</span>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-4">${app.description}</p>
                    <div class="card-footer">
                        <a href="${app.url}" target="_blank" class="try-now-btn">
                            Try Now
                        </a>
                        <button class="like-button" 
                                data-app-name="${app.name}" 
                                onclick="likeSystem.toggleLike('${app.name}', this)">
                            <span class="like-icon">♥</span>
                            <span class="like-count">
                                <span class="loading-dots">...</span>
                            </span>
                        </button>
                    </div>
                </div>
            `;
            container.append(card);
        });

        // 更新所有点赞数显示
        sortedApps.forEach(app => {
            this.updateLikeDisplay(app.name);
        });

        // 添加加载完成的类
        setTimeout(() => {
            container.find('.app-card').addClass('loaded');
        }, sortedApps.length * 100 + 200);
    }

    // 点赞动作
    async toggleLike(appName, likeButton) {
        if (likeButton.classList.contains('liking')) {
            return;
        }

        likeButton.classList.add('liking');

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ appName }),
            });

            const data = await response.json();
            const oldLikes = this.getLikes(appName);
            this.likeStates.set(appName, data.likes);

            // 只更新当前按钮的状态和点赞数
            likeButton.classList.add('liked');
            this.createLikeEffect(likeButton);
            const likeCount = likeButton.querySelector('.like-count');
            likeCount.textContent = this.formatLikeCount(data.likes);

            // 检查是否需要重新排序
            const apps = window.alternativesData?.alternatives || [];
            const needsReorder = this.checkIfNeedsReorder(appName, oldLikes, data.likes, apps);
            
            if (needsReorder) {
                this.smoothReorder();
            }

        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            likeButton.classList.remove('liking');
        }
    }

    // 修改检查是否需要重新排序的方法
    checkIfNeedsReorder(changedAppName, oldLikes, newLikes, apps) {
        const appIndex = apps.findIndex(app => app.name === changedAppName);
        if (appIndex === -1) return false;

        // 如果点赞数相等，不需要重排序
        if (oldLikes === newLikes) return false;

        // 计算旧排序
        const oldState = new Map(this.likeStates);
        oldState.set(changedAppName, oldLikes);
        const getOldLikes = (name) => oldState.get(name) || 0;
        
        const oldSortedApps = [...apps].sort((a, b) => {
            const likesA = getOldLikes(a.name);
            const likesB = getOldLikes(b.name);
            return likesB - likesA;
        });

        // 计算新排序
        const newSortedApps = this.sortByLikes(apps);

        // 比较位置是否发生变化
        const oldPosition = oldSortedApps.findIndex(app => app.name === changedAppName);
        const newPosition = newSortedApps.findIndex(app => app.name === changedAppName);

        return oldPosition !== newPosition;
    }

    // 如果需要平滑重排序，可以添加这个方法
    smoothReorder() {
        const alternativesList = $('#alternatives-list');
        const cards = alternativesList.children().get();
        const apps = window.alternativesData?.alternatives || [];
        
        // 获取所有卡片当前位置
        const originalPositions = cards.map(card => $(card).offset());
        
        // 对卡片进行排序
        const sortedApps = this.sortByLikes(apps);
        const sortedCards = sortedApps.map(app => 
            cards.find(card => $(card).find('[data-app-name]').data('app-name') === app.name)
        );
        
        // 设置卡片的绝对位置
        cards.forEach((card, i) => {
            $(card).css({
                position: 'absolute',
                top: originalPositions[i].top,
                left: originalPositions[i].left,
                width: $(card).width()
            });
        });
        
        // 重新排序DOM
        sortedCards.forEach(card => alternativesList.append(card));
        
        // 触发重排后，添加过渡动画
        requestAnimationFrame(() => {
            alternativesList.children().css({
                transition: 'all 0.5s ease',
                position: 'relative',
                top: 'auto',
                left: 'auto',
                width: 'auto'
            });
        });
    }

    // 格式化点赞数
    formatLikeCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    // 创建点赞特效
    createLikeEffect(button) {
        const hearts = ['❤️', '💜', '💖'];
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = `${Math.random() * 40 + 30}%`;
            heart.style.animationDelay = `${i * 0.15}s`;
            button.appendChild(heart);

            // 动画结束后移除元素
            heart.addEventListener('animationend', () => heart.remove());
        }
    }
}

// 导出实例
window.likeSystem = new LikeSystem(); 