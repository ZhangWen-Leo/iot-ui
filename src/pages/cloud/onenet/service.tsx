import request from '@/utils/request';

export async function list(params?: any) {
    return request(`/jetlinks/one-net/product/_query`, {
        method: 'GET',
        params,
    });
}

export async function remove(id:string) {
    return request(`/jetlinks/one-net/product/${id}`, {
        method: 'DELETE',
    });
}

export async function save(params:any) {
    return request(`/jetlinks/one-net/product`, {
        method: 'PATCH',
        data: params
    });
}

//启用
export async function setEnabled(id: string) {
    return request(`/jetlinks/one-net/product/${id}/_enable`,{
        method: 'POST'
    })
}

//禁用
export async function setDisabled(id: string) {
    return request(`/jetlinks/one-net/product/${id}/_disable`,{
        method: 'POST'
    })
}