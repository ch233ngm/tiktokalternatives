class LikeSystem {
    constructor() {
        this.likeStates = new Map();
        this.initializeLikes();
    }

    // 初始化点赞数据
    async initializeLikes() {
        // TODO: 从API获取点赞数据
        // 临时使用本地数据
        const mockData = {
            'Instagram Reels': 1234,
            'YouTube Shorts': 2345,
            'Triller': 876
        };

        this.likeStates = new Map(Object.entries(mockData));
    }

    // 获取点赞数
    getLikes(appName) {
        return this.likeStates.get(appName) || 0;
    }

    // 点赞动作
    async toggleLike(appName, likeButton) {
        // 防止重复点击
        if (likeButton.classList.contains('liking')) return;

        // 添加点击动画
        likeButton.classList.add('liking');

        try {
            // TODO: 调用API进行点赞/取消点赞
            // 临时模拟API调用
            await new Promise(resolve => setTimeout(resolve, 300));

            const currentLikes = this.getLikes(appName);
            const isLiked = likeButton.classList.contains('liked');

            if (isLiked) {
                this.likeStates.set(appName, currentLikes - 1);
                likeButton.classList.remove('liked');
            } else {
                this.likeStates.set(appName, currentLikes + 1);
                likeButton.classList.add('liked');
                this.createLikeEffect(likeButton);
            }

            // 更新显示的数字
            const likeCount = likeButton.querySelector('.like-count');
            likeCount.textContent = this.formatLikeCount(this.getLikes(appName));

        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            likeButton.classList.remove('liking');
        }
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