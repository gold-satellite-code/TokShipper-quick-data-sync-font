import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:21312', // Flask服务的地址
    timeout: 5000,
});

// 获取类别信息
export const getCategoryInfo = () => {
    return api.get('/get_category_info');
};

// 获取未使用的链接
export const getUnusedLinks = (categoryId) => {
    return api.get('/get_unused_links', {
        params: { category_id: categoryId, limit: 100 },
    });
};

// 更新链接状态
export const updateLinkStatus = (links) => {
    return api.post('/update_link_status', { links });
};

// 同步LR的数据到US数据库
export const synchData = () => {
    return api.get('/synch_data');
};
