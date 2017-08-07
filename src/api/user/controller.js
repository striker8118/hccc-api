import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { User } from '.'
//import stringify from 'node-stringify'

export const index = (req, res, next) => {

  if (req.query.email) {
    User.find({ 'email': req.query.email })
      .then((users) => users.map((user) => user.view()))
      .then(success(res))
      .catch(next)
  } else {
    User.find()
      .then((users) => users.map((user) => user.view()))
      .then(success(res))
      .catch(next)
  }
}

export const show = ({
    params
  }, res, next) =>
  User.findById(params.id)
  .then(notFound(res))
  .then((user) => user ? user.view() : null)
  .then(success(res))
  .catch(next)

export const showMe = ({
    user
  }, res) =>
  res.json(user.view(true))

export const create = ({
    bodymen: {
      body
    }
  }, res, next) =>
  User.create(body)
  .then((user) => user.view(true))
  .then(success(res, 201))
  .catch((err) => {
    /* istanbul ignore else */
    if (err.name === 'MongoError' && err.code === 11000) {
      res.status(409).json({
        valid: false,
        param: 'email',
        message: 'email already registered'
      })
    } else {
      next(err)
    }
  })

export const update = ({
    bodymen: {
      body
    },
    params,
    user
  }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
  .then(notFound(res))
  .then((result) => {
    if (!result) return null
    const isAdmin = user.role === 'admin'
    const isSelfUpdate = user.id === result.id
    if (!isSelfUpdate && !isAdmin) {
      res.status(401).json({
        valid: false,
        message: 'You can\'t change other user\'s data'
      })
      return null
    }
    return result
  })
  .then((user) => user ? _.merge(user, body).save() : null)
  .then((user) => user ? user.view(true) : null)
  .then(success(res))
  .catch(next)

export const destroy = ({
    params
  }, res, next) =>
  User.findById(params.id)
  .then(notFound(res))
  .then((user) => user ? user.remove() : null)
  .then(success(res, 204))
  .catch(next)