const aedes = require('aedes')()
const net = require('net')
const port = 1883 //* MQTT 표준 포트
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost')

const server = net.createServer(aedes.handle)

server.listen(port, () => {
  console.log(`MQTT 서버가 ${port}에서 실행중입니다.`)
})

// server.connect(port, ()=> {
//   console.log(`MQTT 서버가 ${port}에서 실행중입니다.`)
// })

//* 클라이언트 연결 이벤트
aedes.on('client', (client) => {
  console.log(`클라이언트 Connected: ${client.id}`);
})

//* 클라이언트 해제 이벤트
aedes.on('clientDisconnect', (client) => {
  console.log(`클라이언트 DisConnected : ${client.id}`)
})

//* 메세지 발생 이벤트
aedes.on('publish', async (packet, client)=> {
  if (client) {
    if (packet.topic === '/api/todo') {

      console.log(`메세지: ${packet.topic} -> ${packet.payload.toString()}`)
    } else {
      console.log('올바른 사용방법이 아닙니다.')
    }
  }
})