const request = require('supertest');
const { app, server } = require('./server'); // Import both app and server

afterAll(() => {
    server.close(); // Ensure the server closes after tests
});

describe('Test the conspiracy club', () => {
    
   
        test('GET /api/sightings succeds', () => {
            return request(app)
            .get('/api/sightings')
            .expect(200);
        });

        test('GET /api/sightings returns JSON', () => {
            return request(app)
            .get('/api/sightings')
            .expect('Content-type', /json/);
        });

        test('GET /api/sightings includes image URL which begins with /images/ followed by chracters and ends with .jpg', () => {
            return request(app)
                .get('/api/sightings')
                .expect(response => {
                    const sightings = response.body;
                    expect(Array.isArray(sightings)).toBe(true);
                    const imageRegex = /^\/?images\/.*\.(jpg|jpeg)$/;
                    sightings.forEach(sighting => {
                        expect(sighting).toHaveProperty('image');
                        expect(imageRegex.test(sighting.image)).toBe(true);
                    });
                });
        });


        test('GET /api/sightings/:id succeds', () => {
            return request(app)
            .get('/api/sightings/1')
            .expect(200);
        });
        
        
        test('GET /api/sightings/:id returns JSON', () => {
            return request(app)
            .get('/api/sightings/1')
            .expect('Content-type', /json/);
        });

       
        test('GET /api/sightings/:id includes comments array', () => {
            return request(app)
                .get('/api/sightings/1')
                .expect(response => {
                    const sighting = response.body;
                    expect(sighting).toHaveProperty('comments');
                    expect(Array.isArray(sighting.comments)).toBe(true);
                });
        });

       
        test('POST /api/add-sighting fails when required fields are missing', () => {
            const incompleteSighting = {
                image: "images/1011.jpg",
                comments: [
                    "Test comment"
                ]
            };
            return request(app)
                .post('/api/add-sighting')
                .send(incompleteSighting)
                .expect(400)
                .expect('Content-Type', /json/)
                .expect(response => {
                    expect(response.body).toHaveProperty('error', 'Please fill out all fields.');
                });
        });


        test('POST /api/sightings/:id/comments succeeds', () => {
            const newComment = { comment: "Tester comment" };
            return request(app)
                .post(`/api/sightings/9/comments`)
                .send(newComment)
                .expect(200)
                .expect('Content-Type', /json/)
                .expect(response => {
                    expect(response.body).toHaveProperty('message', 'Comment added!');
                    expect(response.body.comments).toEqual(expect.arrayContaining([newComment.comment]));
                });
        });

    
        test('POST /api/sightings/:id/comments fails when comment is missing', () => {
            const incompleteComment = {};
            return request(app)
                .post(`/api/sightings/9/comments`)
                .send(incompleteComment)
                .expect(400)
                .expect('Content-Type', /json/)
                .expect(response => {
                    expect(response.body).toHaveProperty('error', 'Please enter a comment');
                });
        });



    
});






