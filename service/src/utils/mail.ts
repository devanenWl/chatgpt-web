import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'

import nodemailer from 'nodemailer'

import type { MailConfig } from '../storage/model'
import { getCacheConfig } from '../storage/config'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export async function sendVerifyMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `${config.siteConfig.siteTitle} Account Verification`, mailHtml, config.mailConfig)
}

export async function sendVerifyMailAdmin(toMail: string, verifyName: string, verifyUrl: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.admin.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${TO_MAIL}/g, verifyName)
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `${config.siteConfig.siteTitle} Account Application`, mailHtml, config.mailConfig)
}

export async function sendResetPasswordMail(toMail: string, verifyUrl: string) {
  const config = (await getCacheConfig())
  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.resetpassword.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${VERIFY_URL}/g, verifyUrl)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `${config.siteConfig.siteTitle} Reset Password`, mailHtml, config.mailConfig)
}

export async function sendNoticeMail(toMail: string) {
  const config = (await getCacheConfig())

  const templatesPath = path.join(__dirname, 'templates')
  const mailTemplatePath = path.join(templatesPath, 'mail.notice.template.html')
  let mailHtml = fs.readFileSync(mailTemplatePath, 'utf8')
  mailHtml = mailHtml.replace(/\${SITE_DOMAIN}/g, config.siteConfig.siteDomain)
  mailHtml = mailHtml.replace(/\${SITE_TITLE}/g, config.siteConfig.siteTitle)
  sendMail(toMail, `${config.siteConfig.siteTitle} Account Activation`, mailHtml, config.mailConfig)
}

export async function sendTestMail(toMail: string, config: MailConfig) {
  return sendMail(toMail, 'Test mail', 'This is test mail', config)
}

async function sendMail(toMail: string, subject: string, html: string, config: MailConfig) {
	const configs = (await getCacheConfig())
  const mailOptions = {
    from: `${configs.siteConfig.siteTitle} <${config.smtpFrom || config.smtpUserName}>`,
    to: toMail,
    subject,
    html,
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpTsl,
    auth: {
      user: config.smtpUserName,
      pass: config.smtpPassword,
    },
  })
  const info = await transporter.sendMail(mailOptions)
  return info.messageId
}
