$(document).ready(function(){
    $('.gameshow, .leaderboard').hide();
    $('body').css("background-image", "url('assets/main.PNG')")

    $('button.song-button').on('click', function() {
        vcx =  $(this).attr('id') 
        startGame(vcx);
    })

    fetch('https://musicgamebackend.vercel.app/leaderboard')
    .then(res => res.json())
    .then(data => {
        for (const [key, value] of Object.entries(data.scoreData)) {
            let songName;
            switch(key) {
                case "scandalbaby":
                    songName = "Scandal - Scandal Baby"
                    break;
                case "shunkansentimental":
                    songName = "Scandal - Shunkan Sentimental"
                    break;
                case "shinigamieyes":
                    songName = "Grimes - Shinigami Eyes"
                default:
                    songName = "None"
            }
            $('#leaderboard').append(`<p class='score'>${songName}: <span>${value}</span></p>`)
        }
    }) 

    function startGame(song) {
        $('.gamehide').hide();
        $('.gameshow').show();

        let bgImg = "url('assets/" + song + ".jpg')"
        let audioSource;
        let analyser;
        let score = 0;

        $('body').css("background-image", bgImg)

        fetch('https://musicgamebackend.vercel.app/songs/' + song)
            .then(res => res.json())
            .then(data => {
                songAudio = new Audio("data:audio/wav;base64," + data);
                songContext = new AudioContext();

                songAudio.play();
                $('#score').text(score)
                
                audioSource = songContext.createMediaElementSource(songAudio);
                analyser = songContext.createAnalyser();
                audioSource.connect(analyser);
                analyser.connect(songContext.destination);
                analyser.fftSize = 64;
                let bpmConverted;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                window.addEventListener('keypress', function(e) {
                    if (e.key === $('.showkeys > p:last').data('key') && !$('.showkeys > p:last').hasClass('evaluated')) {
                        writeScore(50)
                        $('.showkeys > p:last').addClass('evaluated')
                        $('.showkeys > p:last').css("background", "rgba(2, 143, 2, 0.65)")
                    } else {
                        if (!$('.showkeys > p:last').hasClass('evaluated')) {
                            writeScore(-500)
                            $('.showkeys > p:last').addClass('evaluated')
                            $('.showkeys > p:last').css("background", "rgba(231, 36, 0, 0.65)")
                        }
                    }
                })

                function playNotes() {
                    analyser.getByteFrequencyData(dataArray)
                    let key = 0;
                    for (i=0; i<bufferLength; i++) {
                        key += dataArray[i];
                    }

                    if ($('.showkeys').children().length >= 4) {
                        $('.showkeys').empty();
                    }

                    if (key > 2000 && key <= 3500) {
                        const el = '<p class="neutral" data-key="f">F</p>'
                        $('.showkeys').append(el)
                        key = 0;
                    }
                    if (key > 3500 && key <= 3900) {
                        $('.showkeys').append('<p class="neutral" data-key="g">G</p>')
                        key = 0;
                    }
                    if (key > 3900 && key <= 4000) {
                        $('.showkeys').append('<p class="neutral" data-key="b">B</p>')
                        key = 0;
                    }
                    if (key > 4000 && key <= 4200) {
                        $('.showkeys').append('<p class="neutral" data-key="r">R</p>')
                        key = 0;
                    }
                    if (key > 4200 && key <= 4300) {
                        $('.showkeys').append('<p class="neutral" data-key="w">W</p>')
                        key = 0;
                    }
                    if (key > 4300 && key <= 4400) {
                        $('.showkeys').append('<p class="neutral" data-key="v">V</p>')
                        key = 0;
                    }
                    if (key > 4400 && key <= 4500) {
                        $('.showkeys').append('<p class="neutral" data-key="d">D</p>')
                        key = 0;
                    }
                    if (key > 4500 && key <= 5000) {
                        $('.showkeys').append('<p class="neutral" data-key="a">A</p>')
                        key=0;
                    }
                    if (key > 5000) {
                        $('.showkeys').append('<p class="neutral" data-key="c">C</p>')
                        key=0;
                    }
                }

                function writeScore(num) {
                    score += num;
                    $('#score').text(score)
                }

                if (song === "scandalbaby") {
                    bpmConverted = 923;
                    //TODO: randomize bpmConverted here have multiple intervals
                    var intervalID = setInterval(playNotes, bpmConverted);
                } else if (song === "shunkansentimental") {
                    bpmConverted = 714.3;
                    var intervalID = setInterval(playNotes, bpmConverted);
                } else if (song === "shinigamieyes") {
                    bpmConverted = 1034.5;
                    var intervalID = setInterval(playNotes, bpmConverted);
                }
                
                songAudio.addEventListener('ended', () => {
                    clearInterval(intervalID); 
                    endGame(score, song);
                });
            })
    }

    function endGame(score, song) {
        $('.showkeys').hide();
        $('.scoreh2').css('font-size', '50px;')
        $('.giveupbutton').text('Return')
        
        fetch('https://musicgamebackend.vercel.app/leaderboard',
            {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({score: score, song: song})
            }
        )
        .then(res => res.json())
        .then(data => {
            $('.leaderboard').show()
            let songName;
            console.log(song)
            
            switch (song){
                case "scandalbaby":
                    songName = 'Scandal - Scandal Baby'
                    break;
                case "shunkansentimental":
                    songName = 'Scandal - Shunkan Sentimental'
                    break;
                case "shinigamieyes":
                    songName = 'Grimes - Shinigami Eyes'
                    break;
                default: 
                    songName = 'None'
            }

            if (data.newScore == true) {
                $('.leaderboard').append(`<p class='text-center' style='color:pink'>Song: ${songName}</p><p class='leaderboard-text text-center'><span>New high score!!!</span><br> Your score: ${score}</p>`)
            } else {
                $('.leaderboard').append(`<p class='text-center' style='color:pink'>Song: ${songName}</p><p class='leaderboard-text text-center'>Highest score: ${data.score}<br>Your score: ${score}</p>`)
            }
        })
    }
})