CREATE DATABASE IF NOT EXISTS db_siswa;
USE db_siswa;

CREATE TABLE IF NOT EXISTS siswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  jurusan VARCHAR(50) NOT NULL
);

INSERT INTO siswa (nama, kelas, jurusan) VALUES
('Maulana Rizky', 'XI RPL 1', 'RPL'),
('Steven Rizky', 'XI RPL 2', 'RPL');
