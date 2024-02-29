export default function XHR(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)

    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    xhr.responseType = 'json'

    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(xhr.response)
      } else {
        resolve(xhr.response)
      }
    }

    xhr.onerror = () => {
      reject(xhr.response)
    }

    xhr.send(data)
  })
}
