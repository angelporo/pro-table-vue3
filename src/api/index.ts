import axios from "axios";

export const api = axios.create({
  baseURL: "https://mock.mengxuegu.com/mock/629d727e6163854a32e8307e",
  timeout: 3000,
  // 跨域时候允许携带凭证
  withCredentials: true,
});

interface ResPage<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

interface ResUserList {
  id: string;
  username: string;
  gender: number;
  user: { detail: { age: number } };
  idCard: string;
  email: string;
  address: string;
  createTime: string;
  status: number;
  avatar: string;
  photo: any[];
  children?: ResUserList[];
}

// 获取用户列表
export const getUserList = (params: any) => {
  return new Promise((resolve) => {
    // 模拟异步操作，延迟3秒
    setTimeout(() => {
      const data = {
        code: 200,
        msg: "成功",
        data: {
          records: [1, 2, 3, 4, 2, 5, 65, 23].map((item) => ({
            id: Date.now(),
            username: "王洋",
            gender: 2,
            user: {
              detail: {
                age: 15,
              },
            },
            idCard: "711487385811426478",
            email: "d.fikkley@ttusjor.ng",
            address: "黑龙江省 绥化市",
            createTime: "1973-07-18 07:57:04",
            status: 0,
            avatar: "https://i.imgtg.com/2023/01/16/QR57a.jpg",
          })),
          current: 1,
          size: 10,
          total: 18,
        },
      };
      resolve(data);
    }, 3000);
  });
};
