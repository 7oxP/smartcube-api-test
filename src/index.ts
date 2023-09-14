import NotificationEntity from "./entities/Notification"
import UserEntity from "./entities/UserEntity"

UserEntity.sync({ force: true })
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })


NotificationEntity.sync({ force: true })
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })