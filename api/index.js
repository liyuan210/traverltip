export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API在Vercel环境中运行正常',
    status: 'success',
    data: []
  });
}