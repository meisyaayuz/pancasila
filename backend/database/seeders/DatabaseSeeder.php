<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            'name' => 'Bapak/Ibu Guru BK',
            'email' => 'gurubk@sekolah.com',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'subject' => 'Bimbingan Konseling',
            'avatar' => 'BK',
        ]);
    }
}
